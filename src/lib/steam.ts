import * as _ from 'lodash';
import * as moment from 'moment';
import * as request from 'request-promise-native';
import * as SteamApi from 'steam-api';
import * as xmljson from 'xmljson';

// Get the RSS feed as JSON.
// http://store.steampowered.com/feeds/news.xml
const STEAM_ANNOUNCEMENTS_URL = 'http://store.steampowered.com/feeds/news.xml';

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
  item: {
    title: string;
    pubDate: string;
    link: string;
    guid: string;
    author: string;
    thumbnail: string;
    description: string;
    'content:encoded': string;
    enclosure: string[];
    categories: string[];
  }[];
}

export async function getAnnouncements(oldestResult: Date = null): Promise<Announcement[]> {
  const xmlResult = await request.get(STEAM_ANNOUNCEMENTS_URL);
  const result = await new Promise((resolve, reject) => {
    xmljson.to_json(xmlResult, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }) as any;

  const items = result['rdf:RDF'] as RssResult;

  return await parseResults(items);
}

async function parseResults(rssResult: RssResult): Promise<Announcement[]> {
  return await Promise.all(_(rssResult.item).map(async item => {
    const appIds = item['content:encoded'].match(STEAM_STORE_URL_APP_ID_REGEX);
    const appLinks = item['content:encoded'].match(STEAM_STORE_URL_REGEX);
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
      content: item['content:encoded'],
      app,
      appLink: appLinks ? appLinks[1] : null,
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
