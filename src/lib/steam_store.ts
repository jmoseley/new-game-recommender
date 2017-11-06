import * as _ from 'lodash';
import * as SteamStoreClient from 'steam-store';
import * as SteamApi from 'steam-api';

import SteamDetails, { AppInfo } from './steam_details';

const store = new SteamStoreClient();

export default class SteamStore {
  constructor(private readonly steamDetailsClient: SteamDetails) {}

  public async search(term: string): Promise<AppInfo[]> {
    const results = await store.steam('storeSearch', term);

    // Only return the top 5.
    return await this.buildSearchResults(_.take(results, 5));
  }

  private async buildSearchResults(
    partialResults: SteamStoreClient.SearchResult[],
  ): Promise<AppInfo[]> {
    return await Promise.all(_.map(
      partialResults,
      result => this.steamDetailsClient.getAppInfo(result.id),
    ));
  }
}
