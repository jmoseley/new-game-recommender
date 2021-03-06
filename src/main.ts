import * as _ from 'lodash';
import * as AWS from 'aws-sdk';
import 'source-map-support/register';

import * as secretsDecrypter from './lib/secrets';
import * as config from './lib/config';
import SteamStore from './lib/steam_store';
import SteamDetails from './lib/steam_details';
import PostActions from './lib/post_actions';
import steamAnnouncementsFunction from './functions/steam_announcements';

type CallbackFn = (err?: any, result?: any) => void;

if (config.isLocalDev()) {
  console.info(`-------- Local Development ---------`);
}

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
    const dynamoDB = getDynamoDB();
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
    return callback(null, 'Ok');
  }).catch((error: any) => {
    return callback(error, null);
  });
}

function getDynamoDB(): AWS.DynamoDB {
  let dynamoDbEndpoint: string;
  if (config.isLocalDev()) {
    dynamoDbEndpoint = 'http://localhost:8000';
  }
  return new AWS.DynamoDB({
    region: 'us-west-2',
    endpoint: dynamoDbEndpoint,
  });
}
