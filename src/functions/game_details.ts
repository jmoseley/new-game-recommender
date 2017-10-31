import * as _ from 'lodash';
import * as SteamStore from 'steam-store';

import SteamClient from '../lib/steam';

export interface GameDetails {
  query: string;
  results: any[];
}

export default async function gameDetails(
  steamApiKey: string,
  query: string,
): Promise<GameDetails> {
  const steamApiClient = new SteamClient(steamApiKey);
  const steamStoreClient = new SteamStore();

  console.info(`Searching steam store with query`, query);
  const allResults = await steamStoreClient.steam('storeSearch', query);

  // Get all the details for the top 4 results.
  const apps = await Promise.all(_(allResults)
    .filter(r => r.type === 'app')
    .take(4)
    .map(result => {
      const appId = result.id;
      return steamApiClient.getAppInfo(appId);
    })
    .value());
  return {
    query,
    results: apps,
  };
}
