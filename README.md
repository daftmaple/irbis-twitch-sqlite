# Irbis Twitch bot

## To set up the bot

### Directories and files

1. Make directory `.data` (or wherever you're going to store the database according to your configuration).
2. Copy `config.example.json` to `.data/config.json` (this is where your config exists).

### Database

Read [database documentation](DATABASE.md)

### Twitch configuration

1. Create an app on Twitch Developer dashboard.
2. Take the client id and secret and put it inside the config.json, inside `twitchApplication` field.
3. Generate the first bot refresh token **using your bot account**. This step might be difficult but can be generated via [Twitch Oauth Token Generator](https://github.com/daftmaple/twitch-oauth-token). This step requires you to access permissions listed below.
4. Copy the refresh token from the response to `botRefreshToken` field. This will act as the initial token.
5. Fill in the remaining fields:

   - `botName` your bot name. If you're using your own account for bot, you can fill this with your account name
   - `botChannel` where the bot resides (most likely your own channel)
   - `timezone` according to your [timezone in tz format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   - `lastfm` your last.fm user and api key to access your latest last.fm scrobble. This is optional.

### Building the bot

If you have NodeJS [at least ES2015/ES6 compatible](https://node.green/#ES2015) and package manager, run `yarn build` or `npm run build`.

If you don't have them, just install them 4Head.

### Permissions

The app needs to access these permissions for the bot:

- chat:read
- chat:edit
- channel:moderate
- whispers:read
- whispers:edit

The app needs to access these permissions for the user:

- channel:manage:broadcast

### Starting the bot

`yarn start` or `npm run start`

### Starting the bot with Docker (local Sqlite)

With docker-compose:

```sh
docker-compose up -f docker-compose.mono.yaml --build --detach
```

Without docker-compose:

```sh
docker build -t irbis-twitch .
# PATH_TO_DATA_DIR is equal to $PWD/.data when running locally
# WSL1 Docker PATH_TO_DATA_DIR is $(wslpath -w $(pwd)/.data)
docker run --detach --volume <PATH_TO_DATA_DIR>:/usr/src/.data --name irbis-t-container irbis-twitch
```

## Development

Using VSCode, install both [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
