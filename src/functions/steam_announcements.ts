import * as _ from 'lodash';

import SteamClient from '../lib/steam';
import * as postActions from '../lib/post_actions';

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
export default async function steamAnnouncements(
  steamApiKey: string,
): Promise<void> {
  console.log('Generating Steam Announcements');
  console.info('Getting announcements');

  const steam = new SteamClient(steamApiKey);
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
