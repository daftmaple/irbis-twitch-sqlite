import { container } from 'tsyringe';

import { Query } from '../../db/queries';
import { CommandFunction } from '../../types/handler';

const delcom: CommandFunction = async ({ client, channel, args, msg }) => {
  if (!msg.userInfo.isMod || !msg.userInfo.isBroadcaster) return;

  if (args.length < 2) {
    client.say(channel, 'Not enough parameter');
  }

  const db = container.resolve(Query);

  const cmd = args[1].replace(/^!/, '');

  try {
    await db.deleteCustomCommand(cmd);
    client.say(channel, `Command ${cmd} has been removed`);
  } catch (e) {
    client.say(channel, `Failed to remove command ${cmd}`);
  }
};

export { delcom };
