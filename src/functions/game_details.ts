export interface GameDetails {
  query: string;
}

export default async function gameDetails(
  steamApiKey: string,
  query: string,
): Promise<GameDetails> {
  console.log('Getting game details');
  return {
    query,
  };
}
