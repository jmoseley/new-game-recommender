import * as _ from 'lodash';

import * as steam from './lib/steam';

const MAX_PRICE = 600; // $6

const FREE_WEEKEND_REGEX = /Free Weekend.*/;
const ANNOUNCEMENT_TITLE_FILTERS = [
  FREE_WEEKEND_REGEX,
  /Daily Deal.*/,
  /Midweek Madness.*/,
];

// Entry point.
async function main(): Promise<void> {
  console.info('Running program');
  const allAnnouncements = await steam.getAnnouncements();

  // Filter announcements.
  const announcements = _(allAnnouncements)
    // Only announcements with certain titles.
    .filter(a => _.some(ANNOUNCEMENT_TITLE_FILTERS, pattern => pattern.exec(a.title)))
    // Only multi-player.
    .filter(a => _.some(_.get(a, 'app.categories'), c => c === 'Multi-player'))
    // Only below a certain price, or free weekend.
    .filter(a => {
      const price = _.get(a, 'app.priceCents') || 0;
      return (price < MAX_PRICE || FREE_WEEKEND_REGEX.test(a.title));
    })
    .value();

  console.log(JSON.stringify(announcements, null, 2));
}

main().then(() => {
  console.log('Program end');
}).catch(err => {
  console.error(err);
});
