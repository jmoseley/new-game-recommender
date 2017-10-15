import * as steam from './lib/steam';

// Entry point.
async function main() {
  console.info('Running program');
  const announcements = await steam.getAnnouncements();
  console.log(JSON.stringify(announcements, null, 2));
}

main().then(() => {
  console.log('Program end');
}).catch(err => {
  console.error(err);
});
