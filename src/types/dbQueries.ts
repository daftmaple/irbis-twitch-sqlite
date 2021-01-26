export type getTokenResult = {
  value: string;
  expiry: number | null;
};

export type getHelixUserIdResult = {
  user_id: string;
  login: string;
};

export type getHelixUserIdsResult = getHelixUserIdResult[];

export type customCommandResult = {
  command: string;
  value: string;
};

export type messageFilter = {
  regex: string;
  message: string;
  timeout: number;
};
