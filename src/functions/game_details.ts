export interface GameDetails {
  appId: string;
}

export default async function gameDetails(
  steamApiKey: string,
  appId: string,
): Promise<GameDetails> {
  console.log('Getting game details');
  return {
    appId,
  };
}
