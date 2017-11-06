import * as _ from 'lodash';
import * as Discord from 'discord.js';

import SteamStore from '../lib/steam_store';

const DISCORD_MENTION = '<@374726511061630986>';

const DISCORD_MENTION_REGEX = /<@\d+>/;

const TELL_ME_ABOUT_REGEX = /.*Tell me about (.+)\.?/i;

const HELP_REGEXES = [
  /.*what can you do\??.*/i,
  /.*help.*/i,
];

export default async function handleMessages(
  steamStore: SteamStore,
  discordBotToken: string,
  isMentioned: boolean,
  authorId: string,
  message: string,
  channelId: string,
) {
  // Check if this is a mention.
  if (!isMentioned) {
    console.info(`Not handling message that is not a mention: '${message}'`);
    return;
  }

  // Strip out the mentions.
  message = message.replace(DISCORD_MENTION_REGEX, '').trim();
  console.info(`Handling message: '${message}'`);

  let response: string;
  try {
    response = await getResponse(steamStore, message);
  } catch (error) {
    console.error(error);
    response = 'Whoops, there was an error.';
  }
  if (!response) {
    response = `I didn't understand that. Try 'help'`;
  }

  // Send response.
  const client = new Discord.Client();
  client.on('ready', () => {
    console.info('Client has logged in.');
    if (authorId === client.user.id) {
      console.info(`Not responding to message sent by this user.`);
      return;
    }

    const channel = client.channels.get(channelId);
    if (channel.type !== 'text') {
      console.error('Cannot send messages to a non-text channel.');
      return;
    }

    const textChannel = channel as Discord.TextChannel;
    textChannel.send(response).catch((error: any) => {
      console.error('Error sending message', error);
    });
  });
  await client.login(discordBotToken);

  return 'Ok';
}

const SUGESSTED_GAMES = [
  'Call of Duty',
  `PLAYERUNKNOWN'S BATTLEGROUNDS`,
  `Assassin's Creed Origins`,
  'Cuphead',
  'Divinity: Original Sin 2',
  'Rocket League',
  '.hack//G.U. Last Recode',
  'Total War: WARHAMMER II',
  'Wolfenstein II: The New Colossus',
  'Steam Link',
  'South Park: The Fractured But Whole',
  'Middle-earth: Shadow of War',
  'Counter-Strike: Global Offensive',
  'Steam Controller and Link',
  'Spintires: MudRunner',
  'Black Desert Online',
  'Grand Theft Auto V',
  'Stick Fight: The Game',
  'Stardew Valley',
  'Sid Meier’s Civilization VI',
  'Rust',
  'Blood Bowl 2 - Legendary Edition',
  'ARK: Survival Evolved',
  'RimWorld',
];

// TODO: Get some NLP up in here.
// Get data from more than just steam.
async function getResponse(steamStore: SteamStore, message: string): Promise<string | null> {
  if (_.some(HELP_REGEXES, pattern => pattern.test(message))) {
    return `I can tell you about games. Try '@GameRecommendingBot Tell me about ${_.sample(SUGESSTED_GAMES)}.`;
  }

  if (TELL_ME_ABOUT_REGEX.test(message)) {
    const match = TELL_ME_ABOUT_REGEX.exec(message);
    const gameTitle = match[1];

    const results = await steamStore.search(gameTitle);
    const response = `Here's what I found for '${gameTitle}' from Steam:`;
    return _.reduce(results, (response, result) => {
      return `${response}\n\n${result.name}:\n` +
        `Categories: ${_.join(result.categories, ', ')}\n` +
        `Active Players on Steam: ${result.activePlayers}\n` +
        `${result.link}`;
    }, response);
  }
  return null;
}


