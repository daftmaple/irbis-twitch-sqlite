import { ChatClient } from 'twitch-chat-client';
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';

export type MessageHandlerPayload = {
  client: ChatClient;
  channel: string;
  user: string;
  message: string;
  msg: TwitchPrivateMessage;
};

type CommandFunctionPayload = {
  client: ChatClient;
  channel: string;
  user: string;
  args: string[];
  msg: TwitchPrivateMessage;
};

export type CommandFunction = (params: CommandFunctionPayload) => void;
