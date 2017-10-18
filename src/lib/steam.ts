import * as _ from 'lodash';
import * as moment from 'moment';
import * as request from 'request-promise-native';
import * as SteamApi from 'steam-api';

// Get the RSS feed as JSON.
// https://api.rss2json.com/v1/api.json
// http://store.steampowered.com/feeds/news.xml
const STEAM_ANNOUNCEMENTS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fstore.steampowered.com%2Ffeeds%2Fnews.xml';

const STEAM_PERCENT_REGEX = /.* (\d+)%.*/;
const STEAM_TITLE_TYPE_REGEX = /(.+) - .*/;
const STEAM_STORE_URL_APP_ID_REGEX = /.+store.steampowered.com\/app\/(\d+).*/;
const STEAM_STORE_URL_REGEX = /"(http:\/\/store.steampowered.com\/app\/\d+\/?)"/;

// TODO: Wtf is wrong with the types.
const STEAM_APP_API = new SteamApi.App();
const STEAM_USER_STATS_API = new SteamApi.UserStats();

export interface Announcement {
  publishDate: moment.Moment;
  link: string;
  title: string;
  content: string;
  type: string;
  percentOff: number;
  app: AppInfo;
  appLink: string;
}

export interface AppInfo {
  id: string;
  categories: string[];
  genres: string[];
  priceCents: number;
  name: string;
  activePlayers: number;
}

interface RssResult {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: {
    title: string;
    pubDate: string;
    link: string;
    guid: string;
    author: string;
    thumbnail: string;
    description: string;
    content: string;
    enclosure: string[];
    categories: string[];
  }[];
}

export async function getAnnouncements(oldestResult: Date = null): Promise<Announcement[]> {
  const getResult = await request.get(STEAM_ANNOUNCEMENTS_URL);
  const result = JSON.parse(getResult) as RssResult;
  if (!getResult || result.status !== 'ok') {
    console.error(`Error getting RSS feed: ${JSON.stringify(result, null, 2)}`);
    return [];
  }

  return await parseResults(result);
}

async function parseResults(rssResult: RssResult): Promise<Announcement[]> {
  return await Promise.all(_(rssResult.items).map(async item => {
    const appIds = item.content.match(STEAM_STORE_URL_APP_ID_REGEX);
    const appLinks = item.content.match(STEAM_STORE_URL_REGEX);
    const typeMatch = STEAM_TITLE_TYPE_REGEX.exec(item.title);
    const type = typeMatch ? typeMatch[1] : null;
    const percentMatch = STEAM_PERCENT_REGEX.exec(item.title);
    const percentOff = percentMatch ? parseInt(percentMatch[1]) : null;

    const apps = await Promise.all(_(appIds).tail().uniq().map(getAppInfo).value());
    if (apps.length > 1) {
      console.info(`Found more than 1 app for announcement ${item.link}, ${apps}`);
    }
    const app = _.head(apps);

    return {
      link: item.link,
      publishDate: moment(item.pubDate),
      title: item.title,
      content: item.content,
      app,
      appLink: appLinks[1],
      percentOff,
      type,
    };
  }).compact().value());
}

async function getAppInfo(id: string): Promise<AppInfo> {
  const result = await STEAM_APP_API.appDetails(id);
  const activePlayers = await STEAM_USER_STATS_API.GetNumberOfCurrentPlayers(id);

  return {
    id,
    name: result.name,
    genres: _.map(result.genres, 'description'),
    categories: _.map(result.categories, 'description'),
    priceCents: result.price.final,
    activePlayers,
  };
}
