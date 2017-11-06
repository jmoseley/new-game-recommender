declare module 'steam-store';

export as namespace SteamStoreClient;

export = SteamStoreClient;

declare class SteamStoreClient {
  steam(functionName: SteamStoreClient.FunctionName, ...args: any[]): Promise<SteamStoreClient.SearchResult[]>;
}

declare namespace SteamStoreClient {
  export type FunctionName = 'storeSearch';
  
  export interface SearchResult {
    type: string;
    name: string;
    id: number;
    price: {
      currency: string;
      initial: number;
      final: number;
    };
    tiny_image: string;
    metascore: string;
    platforms: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    streamingvideo: boolean;
  }
}
