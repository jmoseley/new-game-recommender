import * as _ from 'lodash';
import * as AWS from 'aws-sdk';
import Decimal from 'decimal.js';

import { Announcement } from './steam_announcements';
import RawClient from './clients/raw';

const STEAM_ANNOUNCEMENTS_TABLE = 'GRB.PostedSteamAnnouncements';

export default class PostActions {
  reddit: RawClient;

  constructor(
    private readonly dynamodb: AWS.DynamoDB,
    redditUsername: string,
    redditPassword: string,
    redditClientId: string,
    redditClientToken: string,
  ) {
    this.reddit = new RawClient(
      redditUsername,
      redditPassword,
      redditClientId,
      redditClientToken,
    );
  }

  /**
   * This function uses DynamoDB to ensure posts are only posted once.
   */
  public async postAnnouncement(announcement: Announcement): Promise<void> {
    // TODO: Use an ORM or something for this low level stuff.
    const existingPost = await this.dynamodb.getItem({
      TableName: STEAM_ANNOUNCEMENTS_TABLE,
      Key: { PostId: { S: announcement.link } }, // wtf is this shit.
    }).promise();

    if (existingPost.Item) {
      console.info(`Skipping ${announcement.link} because it has already been posted.`);
      return;
    }

    // TODO: Transaction.
    const post = this.makePost(announcement);
    console.info(`Posting to reddit for ${announcement.link}: ${post.title}`);
    await this.reddit.post(post.title, post.content);
    await this.dynamodb.putItem({
      TableName: STEAM_ANNOUNCEMENTS_TABLE,
      Item: {
        PostId: { S: announcement.link },
        // TODO: Expand the table to support these extra params.
        // post: _.mapValues(post, v => ({ S: v })) as any,
        // announcement: _.mapValues(announcement, v => ({ S: v })) as any,
      },
    }, undefined).promise();
    console.info(`Finished saving record for ${announcement.link}`);
  }

  private makePost(a: Announcement): { title: string, content: string } {
    let title;
    const content = `
  Current Active Players: ${a.app.activePlayers}

  ${a.appLink || ''}

  Genres: ${_.join(a.app.genres, ', ')}

  Categories: ${_.join(a.app.categories, ', ')}

  ${this.getFooter()}
  `;

    switch (a.type) {
      case 'Free Weekend':
        title = `${a.app.name} Free Weekend!`;
        break;
      default:
        const priceStr = new Decimal(a.app.priceCents).dividedBy(100).toFixed(2);
        title = `${a.app.name} on Sale for $${priceStr}!`;
        break;
    }

    return { title, content };
  }

  private getFooter(): string {
    return `
  *****
  Beep, Boop, I'm a bot.

  [Github](https://github.com/jmoseley/new-game-recommender)
  `;
  }
}
