import { container } from 'tsyringe';

import { DateTime } from 'luxon';

import { Query } from '../../db/queries';

import { CommandFunction } from '../../types/handler';
import { TwitchApiProvider } from '../../api/twitch';

const followage: CommandFunction = async ({ client, channel, args, msg }) => {
  try {
    const db = container.resolve(Query);
    const { twitchApiClient } = container.resolve(TwitchApiProvider);

    const channelName = channel.replace(/^#/, '');

    // Follower is the user which follows the followed channel
    let followerDisplayName: string | undefined = '';
    let followedDisplayName: string | undefined = '';

    let followerId: string | null = null;
    let followedId: string | null = null;

    switch (args.length - 1) {
      case 0:
        followerDisplayName = msg.userInfo.userName;
        followedDisplayName = channelName;
        followerId = msg.userInfo.userId ? msg.userInfo.userId : null;
        followedId = msg.channelId;
        break;
      case 1:
        followerDisplayName = args[1];
        followedDisplayName = channelName;
        followedId = msg.channelId;
        break;
      case 2:
      default:
        followerDisplayName = args[1];
        followedDisplayName = args[2];
    }

    if (!followedDisplayName || !followerDisplayName) {
      throw new Error("Server error. Can't resolve login");
    }

    // Flow:
    // If id is specified for one (or both), proceed to storing them
    // If id is missing for one (or both), proceed to looking at cache
    // If not found in cache, check HelixUsers
    // If still not found, server error

    // Store if id is defined
    if (followerId) {
      await db.setHelixUserId(followerId, followerDisplayName);
    }

    if (followedId) {
      await db.setHelixUserId(followedId, followedDisplayName);
    }

    // Find them in cache if not defined
    if (!followerId) {
      const result = await db.getHelixUserId(followerDisplayName);
      if (result) followerId = result.user_id;
    }

    if (!followedId) {
      const result = await db.getHelixUserId(followedDisplayName);
      if (result) followedId = result.user_id;
    }

    // Do API request if still undefined (not stored in cache)
    if (!followedId) {
      const user = await twitchApiClient.helix.users.getUserByName(
        followedDisplayName
      );
      if (!user) {
        const message = `User ${followedDisplayName} does not exist`;
        client.say(channel, message);
        throw new Error(message);
      }
      followedId = user.id;
      await db.setHelixUserId(followedId, followedDisplayName);
    }

    if (!followerId) {
      const user = await twitchApiClient.helix.users.getUserByName(
        followerDisplayName
      );
      if (!user) {
        const message = `User ${followerDisplayName} does not exist`;
        client.say(channel, message);
        throw new Error(message);
      }
      followerId = user.id;
      await db.setHelixUserId(followerId, followerDisplayName);
    }

    // If id is still undefined at this point, throw server error
    if (!followedId || !followerId) {
      throw new Error("Server error. Can't resolve user_id");
    }

    const follow = await twitchApiClient.helix.users.getFollows({
      user: followerId,
      followedUser: followedId,
    });
    if (!follow) {
      const message = 'Failed to request Twitch API';
      client.say(channel, message);
      throw new Error(message);
    } else if (follow.data.length !== 1) {
      client.say(
        channel,
        `User ${followerDisplayName} does not follow channel ${followedDisplayName}`
      );
    } else {
      const now = DateTime.fromJSDate(new Date());
      const ft = DateTime.fromJSDate(follow.data[0].followDate);

      const diff = now
        .diff(ft)
        .shiftTo(
          'years',
          'months',
          'days',
          'hours',
          'minutes',
          'seconds',
          'milliseconds'
        );

      const sep = [];

      diff.years &&
        sep.push(diff.years === 1 ? '1 year' : `${diff.years} years`);
      diff.months &&
        sep.push(diff.months === 1 ? '1 month' : `${diff.months} months`);
      diff.days && sep.push(diff.days === 1 ? '1 day' : `${diff.days} days`);
      diff.hours &&
        sep.push(diff.hours === 1 ? '1 hour' : `${diff.hours} hours`);
      diff.minutes &&
        sep.push(diff.minutes === 1 ? '1 minute' : `${diff.minutes} minutes`);
      diff.seconds &&
        sep.push(diff.seconds === 1 ? '1 second' : `${diff.seconds} seconds`);

      const result = `User ${followerDisplayName} has been following ${followedDisplayName} since ${sep.join(
        ', '
      )}`;
      client.say(channel, result);
    }
  } catch (e) {
    console.log(e.message);
  }
};

export { followage };
