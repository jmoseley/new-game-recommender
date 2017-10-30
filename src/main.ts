import * as _ from 'lodash';
import 'source-map-support/register';

import * as secretsDecrypter from './lib/secrets';
import * as steam from './lib/steam';
import * as postActions from './lib/post_actions';

const MAX_PRICE = 1000; // $10

const FREE_WEEKEND_REGEX = /Free Weekend.*/;
const ANNOUNCEMENT_TITLE_FILTERS = [
  FREE_WEEKEND_REGEX,
  /Daily Deal.*/,
  /Midweek Madness.*/,
];

const CATEGORIES = [
  'ONLINE MULTI-PLAYER',
  'MULTI-PLAYER',
  'ONLINE CO-OP',
];

// Entry point.
async function generateSteamAnnouncements(): Promise<void> {
  console.log('Generating Steam Announcements');
  const secrets = await secretsDecrypter.resolve();
  if (!secrets) {
    console.log('Unable to decrypt secrets.');
    return;
  }
  console.info('Getting announcements');

  const allAnnouncements = await steam.getAnnouncements();

  // Filter announcements.
  const announcements = _(allAnnouncements)
    // Only announcements with certain titles.
    .filter(a => _.some(ANNOUNCEMENT_TITLE_FILTERS, pattern => pattern.exec(a.title)))
    // Only multi-player.
    .filter(a => _.some(
      _.get(a, 'app.categories', []),
      c => _.includes(CATEGORIES, c.toUpperCase()),
    ))
    // Only below a certain price, or free weekend.
    .filter(a => {
      const price = _.get(a, 'app.priceCents') || 0;
      return (price < MAX_PRICE || FREE_WEEKEND_REGEX.test(a.title));
    })
    .value();

  console.info(`Found ${announcements.length} announcements to post.`);
  // Do all the posts in order, one at a time.
  let promise = Promise.resolve();
  announcements.forEach(a => {
    promise = promise.then(async () => {
      await postActions.postAnnouncement(a);
    });
  });
  await promise;
}

export function steamAnnouncements(
  _event: any,
  context: any,
  _callback: (err?: any, result?: any) => void,
): Promise<void> {
  console.info('Running function.');
  console.info(context.getRemainingTimeInMillis());
  const promiseResult = generateSteamAnnouncements().then(result => {
    console.info('Finishing function.');
    context.succeed(result);
  }).catch(err => {
    console.info('Error running function.');
    context.fail(err);
  });
  console.info('Done building promise.');
  return promiseResult;
}
