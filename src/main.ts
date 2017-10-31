import 'source-map-support/register';

import * as secretsDecrypter from './lib/secrets';
import steamAnnouncementsFunction from './functions/steam_announcements';
import gameDetailsFunction from './functions/game_details';

type CallbackFn = (err?: any, result?: any) => void;

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
  await steamAnnouncementsFunction(secrets.STEAM_API_KEY).then(() => {
    callback(null, 'Ok');
  }).catch(err => {
    callback(err, null);
  });
}

export async function gameDetails(
  event: any,
  context: any,
  callback: CallbackFn,
): Promise<void> {
  try {
    const secrets = await getSecrets();
    console.log('got event', event);
    if (!event.path.includes('/search')) {
      console.info(`Not implemented`);
      throw new Error('Not implemented');
    }

    const query = event.queryStringParameters.q;
    console.log('Getting game details for query:', query);
    const result = await gameDetailsFunction(secrets.STEAM_API_KEY, query);

    context.succeed({
      statusCode: 200,
      body: JSON.stringify(result),
    });
  } catch (error) {
    context.succeed({
      statusCode: 500,
      body: JSON.stringify(error),
    });
  }
}
