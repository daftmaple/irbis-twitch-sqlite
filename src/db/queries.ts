import { container, injectable } from 'tsyringe';

import { Database } from 'sqlite3';

import {
  getTokenResult,
  getHelixUserIdResult,
  getHelixUserIdsResult,
  messageFilter,
  customCommandResult,
} from '../types/dbQueries';
import { Configuration } from '../config';

type TokenType = 'access' | 'refresh';

@injectable()
export class Query {
  private db: Database;
  constructor() {
    const config = container.resolve(Configuration);
    this.db = config.dataSource.dataSource;
  }

  public setToken(
    tokenType: TokenType,
    value: string,
    expiry: number | null
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO oauth2 (token, value, expiry) VALUES (?, ?, ?)',
        [tokenType, value, expiry],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public getToken(tokenType: TokenType): Promise<getTokenResult> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT value, expiry FROM oauth2 WHERE token = ?',
        [tokenType],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as getTokenResult);
          }
        }
      );
    });
  }

  public setHelixUserId(id: string, login: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO helix_user (user_id, login, last_access) VALUES (?, ?, ?)',
        [id, login, Math.round(new Date().getTime() / 1000)],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Get Helix User ID for last_access within one day or the specified last_access time
  public getHelixUserId(
    login: string,
    minLastAccess?: number
  ): Promise<getHelixUserIdResult | null> {
    if (!minLastAccess)
      minLastAccess = Math.round(new Date().getTime() / 1000) - 86400;
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT login, user_id FROM helix_user WHERE login = ? AND last_access > ? ORDER BY last_access DESC',
        [login, minLastAccess],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) resolve(row as getHelixUserIdResult);
            else resolve(null);
          }
        }
      );
    });
  }

  public getHelixUserIds(logins: string[]): Promise<getHelixUserIdsResult> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT login, user_id, MAX(last_access) FROM helix_user WHERE login IN (' +
          logins
            .map(function () {
              return '?';
            })
            .join(',') +
          ') GROUP BY user_id',
        [logins],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as getHelixUserIdsResult);
          }
        }
      );
    });
  }

  public addCustomCommand(command: string, value: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO custom_command (command, value) VALUES (?, ?)',
        [command, value],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public deleteCustomCommand(command: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.run(
        'DELETE FROM custom_command WHERE command = ?',
        [command],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public customCommand(command: string): Promise<customCommandResult> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT command, value FROM custom_command WHERE command = ?',
        [command],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as customCommandResult);
          }
        }
      );
    });
  }

  public filter(): Promise<messageFilter[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM filter', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as messageFilter[]);
        }
      });
    });
  }
}
