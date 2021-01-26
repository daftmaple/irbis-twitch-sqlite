import { container } from 'tsyringe';

import { DateTime } from 'luxon';

import { Query } from '../../db/queries';
import { TwitchApiProvider } from '../../api/twitch';

import { CommandFunction } from '../../types/handler';

const uptime: CommandFunction = async ({ client, channel, args, msg }) => {
  try {
    const db = container.resolve(Query);
    const { twitchApiClient } = container.resolve(TwitchApiProvider);

    // Try retrieving channelId first from either message or database
    let channelId = msg.channelId;
    let channelName = channel;
    if (args.length > 1) {
      channelName = args[1];
      const userId = await db.getHelixUserId(channelName);
      channelId = userId?.user_id ?? null;
    }

    // If not found, get it from helix
    if (!channelId) {
      const users = await twitchApiClient.helix.users.getUserByName(
        channelName
      );
      if (!users) {
        const message = `User ${channelName} does not exist`;
        client.say(channel, message);
        throw new Error(message);
      }
      channelId = users.id;
      // Store if successful
      try {
        await db.setHelixUserId(channelId, channelName);
      } catch (e) {
        console.log('Failed to set helixUserId');
        console.log(e);
      }
    }

    // At this point, we know that channelId is set
    const data = await twitchApiClient.helix.streams.getStreams({
      userId: channelId,
    });

    if (data && data.data.length) {
      const current = DateTime.fromJSDate(new Date());
      const started = DateTime.fromJSDate(data.data[0].startDate);
      const diff = current
        .diff(started)
        .shiftTo('hours', 'minutes', 'seconds', 'milliseconds');
      const s = diff.toFormat('hh:mm:ss');

      if (args.length > 1) {
        client.say(channel, `${args[1]}'s uptime: ${s}`);
      } else {
        client.say(channel, `Stream uptime: ${s}`);
      }
    } else {
      client.say(channel, 'Channel is offline');
    }
  } catch (e) {
    console.log(e.message);
  }
};

export { uptime };
