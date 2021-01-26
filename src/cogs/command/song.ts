import { container } from 'tsyringe';

import { CommandFunction } from '../../types/handler';
import * as lastfm from '../../requests/lastfm';
import { Configuration } from '../../config';

const song: CommandFunction = async ({ client, channel, args }) => {
  const config = container.resolve(Configuration);

  if (
    !config.lastfmConfiguration?.username ||
    !config.lastfmConfiguration.apiKey
  )
    return;

  const result = await lastfm.GetRecentTracks();
  if (result) {
    if (args.length === 1) {
      // No other args apart from !song
      const latestTrack = result['recenttracks']['track'][0];
      if (latestTrack['@attr']) {
        const track = latestTrack['name'];
        const artist = latestTrack['artist']['#text'];
        client.say(channel, `Now playing: ${track} by ${artist}`);
      } else {
        const track = latestTrack['name'];
        const artist = latestTrack['artist']['#text'];
        client.say(channel, `Last playing: ${track} by ${artist}`);
      }
    } else {
      const param = args[1];
      if (param.match(/previous/i)) {
        const previousTrack = result['recenttracks']['track'][1];
        const track = previousTrack['name'];
        const artist = previousTrack['artist']['#text'];
        client.say(channel, `Previously played: ${track} by ${artist}`);
      }
    }
  } else {
    client.say(channel, 'Failed to do Lastfm API request');
  }
};

export { song };
