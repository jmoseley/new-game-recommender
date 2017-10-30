declare module 'steam-api' {
  export interface AppDetailsResult {
    id: number;
    name: string;
    price: {
      currency: string;
      inital: number;
      final: number;
    },
    categories: {
      id: number;
      description: string;
    }[];
    genres: {
      id: string;
      description: string;
    }[]
  }

  export class App {
    constructor(apiKey?:string);

    appDetails(appId:string):Promise<AppDetailsResult>;
  }

  export class UserStats {
    constructor(apiKey?:string);

    GetNumberOfCurrentPlayers(appId:string):Promise<number>;
  }
}
