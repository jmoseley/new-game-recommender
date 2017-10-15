import * as _ from 'lodash';
import * as SteamApi from 'steam-api';

import * as request from 'request-promise-native';

// Get the RSS feed as JSON.
// https://api.rss2json.com/v1/api.json
// http://store.steampowered.com/feeds/news.xml
const STEAM_ANNOUNCEMENTS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fstore.steampowered.com%2Ffeeds%2Fnews.xml';

const STEAM_PERCENT_REGEX = /.* (\d+)%.*/;
const STEAM_TITLE_TYPE_REGEX = /(.+) - .*/;
const STEAM_STORE_URL_REGEX = /.+store.steampowered.com\/app\/(\d+).*/;

const STEAM_APP_API = new SteamApi.App();

export interface Announcement {
  title: string;
  type: string;
  percentOff: number;
  apps: AppInfo[];
}

export interface AppInfo {
  id: string;
  categories: string[];
  genres: string[];
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
  console.debug('Getting announcements from RSS');
  const getResult = await request.get(STEAM_ANNOUNCEMENTS_URL);
  const result = JSON.parse(getResult) as RssResult;
  if (!getResult || result.status !== 'ok') {
    console.error(`Error getting RSS feed: ${JSON.stringify(result, null, 2)}`);
    return [];
  }

  return await parseResults(result);
}

async function parseResults(rssResult: RssResult): Promise<Announcement[]> {
  console.debug(`Parsing rss results`);
  return await Promise.all(_(rssResult.items).map(async item => {
    const appIds = item.content.match(STEAM_STORE_URL_REGEX);
    const typeMatch = STEAM_TITLE_TYPE_REGEX.exec(item.title);
    const type = typeMatch ? typeMatch[1] : null;
    const percentMatch = STEAM_PERCENT_REGEX.exec(item.title);
    const percentOff = percentMatch ? parseInt(percentMatch[1]) : null;

    const apps = await Promise.all(_(appIds).tail().uniq().map(getAppInfo).value());

    return {
      title: item.title,
      apps,
      percentOff,
      type,
    };
  }).compact().value());
}

async function getAppInfo(id: string): Promise<AppInfo> {
  const result = await STEAM_APP_API.appDetails(id);

  return {
    id,
    genres: _.map(result.genres, 'description'),
    categories: _.map(result.categories, 'description'),
  };
}