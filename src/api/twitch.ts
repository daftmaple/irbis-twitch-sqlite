import { singleton } from 'tsyringe';

import { ApiClient } from 'twitch';
import { AuthProvider } from 'twitch-auth';

@singleton()
export class TwitchApiProvider {
  public twitchApiClient: ApiClient;
  constructor(authProvider: AuthProvider) {
    this.twitchApiClient = new ApiClient({ authProvider });
  }
}
