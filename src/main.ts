import * as _ from 'lodash';
import * as AWS from 'aws-sdk';
import 'source-map-support/register';

import * as secretsDecrypter from './lib/secrets';
import PostActions from './lib/post_actions';
import steamAnnouncementsFunction from './functions/steam_announcements';
// import receiveMessagesFunction from './functions/receive_messages';

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

export async function steamAnnouncements(
  _event: any,
  _context: any,
  callback: CallbackFn,
): Promise<void> {
  const secrets = await getSecrets();
  const postActions = new PostActions(
    dynamoDB,
    secrets.REDDIT_USERNAME,
    secrets.REDDIT_PASSWORD,
    secrets.REDDIT_CLIENT_ID,
    secrets.REDDIT_CLIENT_TOKEN,
  );
  await steamAnnouncementsFunction(secrets.STEAM_API_KEY, postActions).then(() => {
    callback(null, 'Ok');
  }).catch(err => {
    callback(err, null);
  });
}

export async function receiveMessages(
  event: any,
  context: any,
  callback: CallbackFn,
): Promise<void> {
  try {
    const secrets = await getSecrets();
    console.log('got event', event);

    const message = _.get(event.queryStringParameters, 'message');
    console.log('Received message:', message);
    // const result = await receiveMessagesFunction(message);

    context.succeed({
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    context.succeed({
      statusCode: 500,
      body: JSON.stringify(error),
    });
  }
}
