PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE oauth2 (
      token VARCHAR PRIMARY KEY NOT NULL,
      value VARCHAR NOT NULL,
      expiry INTEGER
    );
CREATE TABLE helix_user (
      user_id VARCHAR UNIQUE NOT NULL,
      login VARCHAR NOT NULL,
      last_access INTEGER NOT NULL
    );
CREATE TABLE filter (
      regex VARCHAR NOT NULL,
      message VARCHAR NOT NULL,
      timeout INTEGER NOT NULL
    );
CREATE TABLE custom_command (
      command VARCHAR UNIQUE NOT NULL,
      value VARCHAR NOT NULL
    );
INSERT OR IGNORE INTO oauth2 (token, value, expiry) VALUES ('access', '', 0);
-- PUT YOUR REFRESH TOKEN ON THE <TOKEN_HERE> FIELD WITHOUT ANGLED BRACKET
INSERT OR IGNORE INTO oauth2 (token, value) VALUES ('refresh', '<TOKEN_HERE>');
COMMIT;
