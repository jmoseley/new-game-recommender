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
  console.log('got event', event);
  const appId = event.pathParameters.appId;
  console.log('Getting game details for appId:', appId);
  if (!appId) {
    callback('Must provide appId');
    return;
  }
  try {
    const secrets = await getSecrets();
    context.succeed(await gameDetailsFunction(secrets.STEAM_API_KEY, 'fake appId'));
  } catch (error) {
    callback(error);
  }
}
