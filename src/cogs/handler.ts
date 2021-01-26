import { injectable, container } from 'tsyringe';

import { commandMap } from './command';
import { commandParser } from './custom/parser';
import filterMessage from './filter/function';
import { Query } from '../db/queries';
import { MessageHandlerPayload } from '../types/handler';
import { Configuration } from '../config';

@injectable()
export class MessageHandler {
  private botName: string;
  constructor() {
    const config = container.resolve(Configuration);
    this.botName = config.botName;
  }

  public handleMessage = async (arg: MessageHandlerPayload) => {
    if (arg.user === this.botName) return;

    if (await filterMessage(arg)) {
      this.handleCommand(arg);
    }
  };

  private handleCommand = async (arg: MessageHandlerPayload) => {
    const { client, channel, user, message, msg } = arg;

    const args = message.trim().split(' ');
    if (!args[0].startsWith('!')) return;

    // Replace first char of first args, and pass in the arguments to handler
    const cmd = args[0].replace(/^!/, '');
    const newArgs: string[] = [cmd, ...args.slice(1)];

    if (cmd === 'commands') {
      client.say(
        channel,
        `Commands: ` + Array.from(commandMap.keys()).join(', ')
      );
    } else {
      const handler = commandMap.get(cmd);
      if (handler) {
        handler({ client, channel, user, args: newArgs, msg });
      } else {
        // Get handler from db
        const db = container.resolve(Query);
        try {
          const result = await db.customCommand(cmd);
          const parsedCommand = commandParser(result.value, newArgs);
          client.say(channel, parsedCommand);
        } catch (e) {
          // Do nothing
        }
      }
    }
  };
}
