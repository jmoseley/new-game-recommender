import * as _ from 'lodash';
import * as SteamApi from 'steam-api';

export interface AppInfo {
  id: number;
  categories: string[];
  genres: string[];
  priceCents: number;
  name: string;
  activePlayers: number;
  link?: string;
}

export default class SteamDetails {
  appApi: SteamApi.App;
  userStatsApi: SteamApi.UserStats;

  constructor(steamApiKey: string) {
    this.appApi = new SteamApi.App(steamApiKey);
    this.userStatsApi = new SteamApi.UserStats(steamApiKey);
  }

  async getAppInfo(id: number): Promise<AppInfo> {
    if (!id) {
      return null;
    }

    const result = await this.appApi.appDetails(`${id}`);
    const activePlayers = await this.userStatsApi.GetNumberOfCurrentPlayers(`${id}`);

    return {
      id,
      name: result.name,
      genres: _.map(result.genres, 'description'),
      categories: _.map(result.categories, 'description'),
      priceCents: result.price.final,
      activePlayers,
      link: `http://store.steampowered.com/app/${id}`,
    };
  }

}
