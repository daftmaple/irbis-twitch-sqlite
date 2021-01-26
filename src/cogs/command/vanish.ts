import { CommandFunction } from '../../types/handler';

const vanish: CommandFunction = async ({ client, channel, user }) => {
  client.timeout(channel, user, 1).catch((e) => {
    console.log(e);
  });
};

export { vanish };
