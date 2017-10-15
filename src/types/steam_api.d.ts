declare interface AppDetailsResult {
  id: number;
  name: string;
  priceCents: number;
  categories: {
    id: number;
    description: string;
  }[];
  genres: {
    id: string;
    description: string;
  }[]
}

declare class App {
  constructor(apiKey?:string);

  appDetails(appId:string):AppDetailsResult;
}

declare module 'steam-api';
