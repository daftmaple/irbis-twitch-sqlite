import 'reflect-metadata';
import { container } from 'tsyringe';

// Twitch
import {
  AccessToken,
  RefreshableAuthProvider,
  StaticAuthProvider,
} from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';

// DI
import { Configuration } from './config';
import { MessageHandler } from './cogs/handler';
import { TwitchApiProvider } from './api/twitch';

import { Query } from './db/queries';

async function main() {
  // Retrieve token
  const data = container.resolve(Query);
  const accessToken = await data.getToken('access');
  const refreshToken = await data.getToken('refresh');

  // Parse configuration first before initializing app
  const config = container.resolve(Configuration);
  const { clientId, clientSecret } = config.twitchApplication;

  // Create new instance
  try {
    const authProvider = new RefreshableAuthProvider(
      new StaticAuthProvider(clientId, accessToken.value),
      {
        clientSecret,
        refreshToken: refreshToken.value,
        expiry: new Date(accessToken.expiry ?? 0),
        onRefresh: onRefresh,
      }
    );

    // Provide ApiClient via provider
    container.register<TwitchApiProvider>(TwitchApiProvider, {
      useValue: new TwitchApiProvider(authProvider),
    });

    const channel = config.botChannel;
    const client = new ChatClient(authProvider, { channels: [channel] });

    client.connect();

    client.onConnect(() => {
      console.log(`Connected with user ${config.botName}`);
    });

    client.onMessage((channel, user, message, msg) => {
      const commandHandler = container.resolve(MessageHandler);
      commandHandler.handleMessage({
        client,
        channel,
        user,
        message,
        msg,
      });
    });

    client.onDisconnect((manually, reason) => {
      if (!manually) {
        console.log('Disconnected. Reason: ' + reason?.message);
      }
    });
  } catch (e) {
    // Something is definitely wrong
    console.log(e);
    if (e instanceof Error) {
      console.log(e.stack);
    }
    throw e;
  }
}

async function onRefresh(token: AccessToken) {
  const data = container.resolve(Query);

  const { accessToken, refreshToken, expiryDate } = token;
  await data.setToken(
    'access',
    accessToken,
    expiryDate === null ? null : expiryDate.getTime()
  );
  await data.setToken('refresh', refreshToken, null);
}

main();
