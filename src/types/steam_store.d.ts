declare module 'steam-store';

declare class SteamStoreClient {
  public steam(functionName: string, ...args: any[]): Promise<any>;
}

declare function SteamStore():SteamStoreClient;
