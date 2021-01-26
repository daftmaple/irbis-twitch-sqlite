# Database

| Condition                                 | Requirements                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running <1.0.0                            | Sqlite3, and the [setup below](#pre-postgres-version)                                                                                                                                                                                                                               |
| Running >=1.0.0 for the first time        | postgresql-client and postgresql (Either Docker or [Standalone](https://www.postgresql.org/download/)). Docker version will require you to install postgresql-client separately while standalone gives you both. You can jump straight to [postgres setup](#postgres-version-setup) |
| Upgrading from version <1.0.0 to >= 1.0.0 | All dependencies stated above. Migration should be done manually                                                                                                                                                                                                                    |

---

## Pre-postgres version

**This part is required for Irbis Twitch version <1.0.0**

1. Copy `sqlite3_init.example.sql` to `sqlite3_init.sql`.
2. Modify line 24 of your `sqlite3_init.sql` file where you need to replace `<TOKEN_HERE>` with your refresh token.

```sql
-- PUT YOUR REFRESH TOKEN ON THE <TOKEN_HERE> FIELD WITHOUT ANGLED BRACKET
INSERT OR IGNORE INTO oauth2 (token, value) VALUES ('refresh', '<TOKEN_HERE>');
```

3. Install sqlite3.
4. Make a database in the directory specified above, called `bot.db` by opening it in sqlite3. Run the `sqlite3_init.sql` script by running the script below on your shell.

```sh
cat sql/sqlite3_init.sql | sqlite3 .data/bot.db
```

5. When the bot runs, they'll do the initial database setup.

---

## Postgres version setup

**This part is required for Irbis Twitch version >=1.0.0**

For docker deployment, port 5432 (or whatever else) that is open locally is needed to execute the migration script. It is possible to run it via `docker exec` [with some pipe redirections](https://stackoverflow.com/questions/34779894/executing-sql-scripts-on-docker-container).

### With compose:

You can configure the compose file to have your database only connected to your internal network. Compose spec is available [here](https://github.com/compose-spec/compose-spec/blob/master/spec.md).

```sh
docker-compose -f docker-compose.db.yaml up --detach
```

### Without compose:

```sh
# WSL1 Docker PATH_TO_DATA_DIR is $(wslpath -w $(pwd)/.data/postgres)
# Fill in DOTENV file with environment listed in compose
docker run --detach \
  --volume <PATH_TO_DATA_DIR>:/var/lib/postgresql/data \
  --env POSTGRES_PASSWORD=<INSERT_PASSWORD_HERE> \
  --env POSTGRES_USER=postgres \
  --env POSTGRES_DB=irbis_db \
  -p 127.0.0.1:5432:5432 \
  --name irbis_db postgres:13.1
```

> Note: Your path to data directory in either `docker-compose.db.yaml` or without compose can be a custom path.

## Initialize database

1. Install postgresql client with command

```sh
sudo apt-get install postgresql-client
```

2. Connect to your local postgresql instance, put your password

```sh
# User, host, and port can be custom depending on POSTGRES_USER and your initial config environment
psql -h 127.0.0.1 -p 5432 -U postgres -W
```

3. Dump the init sql script to your table

```sh
# psql <user> -h <host> -p <port> -d <database> -W -f postgresql_init.sql
psql postgres -h 127.0.0.1 -p 5432 -d irbis_db -W -f postgresql_init.sql
```

Note: if you were migrating from sqlite3, read [sqlite to postgres migration](#Migration-from-sqlite-to-postgres) to copy your old information to the new database.
