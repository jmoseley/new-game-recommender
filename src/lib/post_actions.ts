import * as AWS from 'aws-sdk';
import Decimal from 'decimal.js';

import { Announcement } from './steam';
import RawClient from './clients/raw';

const STEAM_ANNOUNCEMENTS_TABLE = 'GRB.PostedSteamAnnouncements';

const dynamodb = new AWS.DynamoDB({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-west-2',
});

const reddit = new RawClient(
  process.env.REDDIT_USERNAME,
  process.env.REDDIT_PASSWORD,
  process.env.REDDIT_CLIENT_ID,
  process.env.REDDIT_CLIENT_TOKEN,
);

/**
 * This function uses DynamoDB to ensure posts are only posted once.
 */
export async function postAnnouncement(announcement: Announcement): Promise<void> {
  // TODO: Use an ORM or something for this low level stuff.
  const existingPost = await dynamodb.getItem({
    TableName: STEAM_ANNOUNCEMENTS_TABLE,
    Key: { PostId: { S: announcement.link } }, // wtf is this shit.
  }).promise();

  if (existingPost.Item) {
    console.info(`Skipping ${announcement.link} because it has already been posted.`);
    return;
  }

  // TODO: Transaction.
  const post = makePost(announcement);
  console.info(`Posting to reddit for ${announcement.link}: ${post.title}`);
  await reddit.post(post.title, post.content);
  await dynamodb.putItem({
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

function makePost(a: Announcement): { title: string, content: string } {
  let title;
  let content;
  switch (a.type) {
    case 'Free Weekend':
      title = `${a.app.name} Free Weekend!`;
      content = a.content;
      break;
    default:
      const priceStr = new Decimal(a.app.priceCents).dividedBy(100).toFixed(2);
      title = `${a.app.name} on Sale for $${priceStr}`;
      content = a.content;
      break;
  }

  return { title, content };
}
