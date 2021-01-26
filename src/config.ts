import { singleton } from 'tsyringe';

import fs from 'fs';
import path from 'path';

import sqlite3 from 'sqlite3';
import Ajv, { DefinedError, JSONSchemaType } from 'ajv';
import { IANAZone } from 'luxon';

const ajv = new Ajv();

type ClientConfiguration = {
  clientId: string;
  clientSecret: string;
};

type LastfmConfiguration = {
  username: string;
  apiKey: string;
};

type SqliteDatabaseConfiguration = {
  driver: 'sqlite3';
  path: string;
};

type PostgresDatabaseConfiguration = {
  driver: 'postgres';
  host: string;
  name: string;
  user: string;
  password: string;
};

type DatabaseConfiguration =
  | SqliteDatabaseConfiguration
  | PostgresDatabaseConfiguration;

type MainConfiguration = {
  botName: string;
  botRefreshToken: string;
  botChannel: string;
  twitchApplication: ClientConfiguration;
  lastfm: LastfmConfiguration | null;
  timezone: string | null;
  database: DatabaseConfiguration;
};

const configFileSchema: JSONSchemaType<MainConfiguration> = {
  type: 'object',
  properties: {
    botName: {
      type: 'string',
      minLength: 1,
    },
    botRefreshToken: {
      type: 'string',
      minLength: 1,
    },
    botChannel: {
      type: 'string',
      minLength: 1,
    },
    twitchApplication: {
      type: 'object',
      properties: {
        clientId: {
          type: 'string',
          minLength: 1,
        },
        clientSecret: {
          type: 'string',
          minLength: 1,
        },
      },
      required: ['clientId', 'clientSecret'],
    },
    lastfm: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          minLength: 1,
        },
        apiKey: {
          type: 'string',
          minLength: 1,
        },
      },
      required: ['apiKey', 'username'],
    },
    timezone: {
      type: 'string',
      minLength: 1,
    },
    database: {
      type: 'object',
      if: {
        type: 'object',
        properties: {
          driver: {
            type: 'string',
            const: 'sqlite3',
          },
        },
      },
      then: {
        type: 'object',
        properties: {
          driver: {
            type: 'string',
            const: 'sqlite3',
          },
          path: {
            type: 'string',
          },
        },
        required: ['driver', 'path'],
      },
      else: {
        type: 'object',
        properties: {
          driver: {
            type: 'string',
            const: 'postgres',
          },
          host: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          user: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
        },
        required: ['driver', 'host', 'name', 'user', 'password'],
      },
      required: ['driver'],
    },
  },
  required: [
    'botName',
    'botRefreshToken',
    'botChannel',
    'twitchApplication',
    'database',
  ],
};

type Sqlite3DataSource = {
  driver: 'sqlite3';
  dataSource: sqlite3.Database;
};

type DataSource = Sqlite3DataSource;

const validate = ajv.compile<MainConfiguration>(configFileSchema);

@singleton()
export class Configuration {
  public botName: string;
  public botRefreshToken: string;
  public botChannel: string;
  public twitchApplication: ClientConfiguration;
  public lastfmConfiguration: LastfmConfiguration | null;
  public timezone: string | null;
  public database: DatabaseConfiguration;
  public botVersion: string;

  public dataSource: DataSource;

  constructor() {
    const configFile = fs.readFileSync(
      path.join(process.cwd(), '.data', 'config.json'),
      'utf-8'
    );
    const packageFile = fs.readFileSync(
      path.join(process.cwd(), 'package.json'),
      'utf-8'
    );

    const configuration = JSON.parse(configFile);
    const packageVersion: string = JSON.parse(packageFile).version;

    // Validate JSON configuration
    if (validate(configuration)) {
      console.log('Valid configuration found');
    } else {
      for (const err of validate.errors as DefinedError[]) {
        console.error(`${err.message} in object ${err.dataPath}`);
      }
      process.exit(1);
    }

    // Validate timezone
    if (configuration.timezone) {
      const tz = IANAZone.create(configuration.timezone);

      if (!tz.isValid) {
        console.log(`Invalid timezone: ${configuration.timezone}`);
        console.log('Irbisbot proceeds with machine timezone');
      }
    }

    this.botName = configuration.botName;
    this.botRefreshToken = configuration.botRefreshToken;
    this.botChannel = configuration.botChannel;
    this.twitchApplication = configuration.twitchApplication;
    this.lastfmConfiguration = configuration.lastfm;
    this.timezone = configuration.timezone;
    this.database = configuration.database;
    this.botVersion = packageVersion;

    if (configuration.database.driver === 'sqlite3') {
      this.dataSource = {
        driver: 'sqlite3',
        dataSource: new sqlite3.Database(
          configuration.database.path ||
            path.join(process.cwd(), '.data', 'bot.db'),
          sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE
        ),
      };
    } else if (configuration.database.driver === 'postgres') {
      console.error('Not implemented yet');
      process.exit(1);
    } else {
      console.error('Invalid configuration. Ajv validation did not work');
      process.exit(1);
    }
  }
}
