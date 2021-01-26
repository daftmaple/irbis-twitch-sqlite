import { container } from 'tsyringe';

import { CommandFunction } from '../../types/handler';
import { Configuration } from '../../config';
import { IANAZone } from 'luxon';

const time: CommandFunction = ({ client, channel, args }) => {
  const config = container.resolve(Configuration);

  // This function takes either:
  // - machine time as your current time if TIMEZONE_TZ_NAME is not provided or empty
  // - takes TZ database name as time zone
  // Refer to https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for the whole list
  const date = new Date();

  let tz = config.timezone;
  if (args.length > 1) {
    // Use args[1] as timezone
    const checkTz = IANAZone.create(args[1]);
    if (!checkTz.isValid) {
      client.say(channel, 'Invalid timezone');
      return;
    }
    tz = args[1];
  }

  let t = date.toLocaleTimeString();
  if (tz && tz.length) {
    t = date.toLocaleTimeString('en-US', { timeZone: tz });
  }

  if (args.length > 1) {
    client.say(channel, `Local time for ${args[1]}: ${t}`);
  } else {
    client.say(channel, `My local time: ${t}`);
  }
};

export { time };
