import { container } from 'tsyringe';

import { Query } from '../../db/queries';
import { CommandFunction } from '../../types/handler';

import { commands } from './index';

const addcom: CommandFunction = async ({ client, channel, args, msg }) => {
  if (!msg.userInfo.isMod || !msg.userInfo.isBroadcaster) return;

  if (args.length < 3) {
    client.say(channel, 'Not enough parameter');
  }

  const db = container.resolve(Query);

  const cmd = args[1].replace(/^!/, '');
  const val = args.slice(2, args.length).join(' ');

  if (commands.indexOf(cmd) !== -1) {
    client.say(channel, `Command "${cmd}" is reserved`);
  } else {
    try {
      await db.addCustomCommand(cmd, val);
      client.say(channel, `Command "${cmd}" has been added`);
    } catch (e) {
      client.say(channel, `Failed to add command ${cmd}`);
    }
  }
};

export { addcom };
