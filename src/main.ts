import * as _ from 'lodash';
import * as AWS from 'aws-sdk';
import 'source-map-support/register';

import * as secretsDecrypter from './lib/secrets';
import SteamStore from './lib/steam_store';
import SteamDetails from './lib/steam_details';
import PostActions from './lib/post_actions';
import steamAnnouncementsFunction from './functions/steam_announcements';
import handleMessages from './functions/handle_messages';

type CallbackFn = (err?: any, result?: any) => void;

const dynamoDB = new AWS.DynamoDB({
  region: 'us-west-2',
});

async function getSecrets(): Promise<secretsDecrypter.Secrets> {
  const secrets = await secretsDecrypter.resolve();
  if (!secrets) {
    console.log('Unable to decrypt secrets.');
    return;
  }
  return secrets;
}

export function steamAnnouncements(
  _event: any,
  _context: any,
  callback: CallbackFn,
): void {
  getSecrets().then(async secrets => {
    const postActions = new PostActions(
      dynamoDB,
      secrets.REDDIT_USERNAME,
      secrets.REDDIT_PASSWORD,
      secrets.REDDIT_CLIENT_ID,
      secrets.REDDIT_CLIENT_TOKEN,
    );
    const steamDetailsClient = new SteamDetails(secrets.STEAM_API_KEY);
    await steamAnnouncementsFunction(steamDetailsClient, postActions);
  }).then(() => {
    callback(null, 'Ok');
  }).catch((error: any) => {
    callback(error, null);
  });
}

export function receiveMessages(
  event: any,
  context: any,
  callback: CallbackFn,
): void {
  console.info(JSON.stringify(event, null, 2));
  getSecrets().then(async (secrets) => {
    const message = _.get(event.queryStringParameters, 'message');
    const channelId = _.get(event.queryStringParameters, 'channelId');
    const isMentioned = _.get(event.queryStringParameters, 'isMentioned') === 'true' ? true : false;
    const authorId = _.get(event.queryStringParameters, 'authorId');

    const steamDetailsClient = new SteamDetails(secrets.STEAM_API_KEY);
    const steamStore = new SteamStore(steamDetailsClient);

    const result = await handleMessages(steamStore, secrets.DISCORD_BOT_TOKEN, isMentioned, authorId, message, channelId);

    context.succeed({
      statusCode: 200,
      body: result,
    });
  }).catch((error: any) => {
    console.error(error);
    context.succeed({
      statusCode: 500,
      body: error,
    });
  });
}
