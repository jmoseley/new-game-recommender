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
const STEAM_APP_API: any = null; // = new SteamApi.App();
const STEAM_USER_STATS_API: any = null; // = new SteamApi.UserStats();

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

export default class SteamClient {
  appApi: SteamApi.App;
  userStatsApi: SteamApi.UserStats;

  constructor(steamApiKey: string) {
    this.appApi = new SteamApi.App(steamApiKey);
    this.userStatsApi = new SteamApi.UserStats(steamApiKey);
  }

  async getAnnouncements(oldestResult: Date = null): Promise<Announcement[]> {
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

    return await this.parseResults(items);
  }

  private async parseResults(rssResult: RssResult): Promise<Announcement[]> {g
    return await Promise.all(_(rssResult.item).map(async item => {
      const appIdsResult = item['content:encoded'].match(STEAM_STORE_URL_APP_ID_REGEX);
      const appLinks = item['content:encoded'].match(STEAM_STORE_URL_REGEX);
      const typeMatch = STEAM_TITLE_TYPE_REGEX.exec(item.title);
      const type = typeMatch ? typeMatch[1] : null;
      const percentMatch = STEAM_PERCENT_REGEX.exec(item.title);
      const percentOff = percentMatch ? parseInt(percentMatch[1]) : null;

      const appIds = _(appIdsResult).tail().uniq().value();
      if (appIds.length > 1) {
        console.info(`Found more than 1 app for announcement ${item.link}, ${appIds}`);
      }
      const appId = _.head(appIds);

      const app = await this.getAppInfo(appId);

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

  private async getAppInfo(id: string): Promise<AppInfo> {
    if (!id) {
      return null;
    }

    const result = await this.appApi.appDetails(id);
    const activePlayers = await this.userStatsApi.GetNumberOfCurrentPlayers(id);

    return {
      id,
      name: result.name,
      genres: _.map(result.genres, 'description'),
      categories: _.map(result.categories, 'description'),
      priceCents: result.price.final,
      activePlayers,
    };
  }
}
