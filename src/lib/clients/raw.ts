import * as moment from 'moment';
import { promisify } from 'util';

const USER_AGENT = 'node:GameRecommendingBot:v0.0.1 (by /u/GameRecommendingBot)';

const SUBREDDIT = 'bottesting';

// TODO: Get some types for this.
const rawjs = require('raw.js');

const RATELIMIT_REGEX = /.*try again in (\d+ [a-z]+)\..*/;

export default class RawClient {
  private reddit: any;
  private nextPost: Date = new Date();

  private haveAuthed: boolean = false;

  constructor(
    private username: string,
    private password: string,
    clientId: string,
    clientToken: string,
    private subreddit= SUBREDDIT,
    userAgent= USER_AGENT,
  ) {
    this.reddit = new rawjs(userAgent);
    this.reddit.setupOAuth2(clientId, clientToken, 'https://www.reddit.com/user/GameRecommendingBot/');

  }

  public async getRateLimitDetails(): Promise<any> {
    return this.reddit.getRateLimitDetails();
  }

  public async post(title: string, content: string, retry: boolean = true): Promise<string> {
    await this.tryAuth();

    let postId: string;
    postId = await new Promise((resolve, reject) => {
      this.reddit.submit({
        title,
        text: content,
        r: this.subreddit,
        save: true,
        inboxReplies: true,
      }, (err: any, id: string) => {
        if (err) {
          reject(new Error(`Error submitting post: ${err}`));
        } else {
          resolve(id);
        }
      });
    }) as any;

    return postId;
  }

  private async tryAuth(): Promise<any> {
    if (this.haveAuthed) {
      return;
    }

    const response = await new Promise((resolve, reject) => {
      this.reddit.auth({
        username: this.username,
        password: this.password,
      }, (err: any, response: any) => {
        if (err) {
          reject(new Error(`Error doing auth: ${err}`));
        } else {
          resolve(response);
        }
      });
    });
    this.haveAuthed = true;

    console.log(JSON.stringify(this.getRateLimitDetails()));

    return response;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
