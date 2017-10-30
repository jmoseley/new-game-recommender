import 'source-map-support/register';

import * as secretsDecrypter from './lib/secrets';
import steamAnnouncementsFunction from './functions/steam_announcements';

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
