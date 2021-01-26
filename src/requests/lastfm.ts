import { container } from 'tsyringe';

import axios from 'axios';

import { isSuccessful } from '../utils/requests';
import { Configuration } from '../config';

export const GetRecentTracks = async () => {
  const config = container.resolve(Configuration);

  const username = config.lastfmConfiguration?.username;
  const api_key = config.lastfmConfiguration?.apiKey;
  if (!username || !api_key) {
    return null;
  }

  const result = await axios.get(
    `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${api_key}&format=json&limit=2`
  );

  if (!isSuccessful(result.status)) {
    return null;
  }

  return result.data;
};
