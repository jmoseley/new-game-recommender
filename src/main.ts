import * as _ from 'lodash';

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
async function main(): Promise<void> {
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

const lambdaHandler = async (_event: any, _context: any, callback: any) => {
  console.info(`Program start`);
  await main().then(() => {
    console.info('Program end');
  }).catch(err => {
    console.error(err);
  });
};

if (process.env.RUN_LOCAL) {
  main().then(() => {
    console.log('Program end');
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export default lambdaHandler;
