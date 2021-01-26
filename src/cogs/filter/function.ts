import { container } from 'tsyringe';

import { Query } from '../../db/queries';
import { MessageHandlerPayload } from '../../types/handler';

const filterMessage = async (arg: MessageHandlerPayload): Promise<boolean> => {
  const { client, channel, user, message } = arg;

  const db = container.resolve(Query);
  const filters = await db.filter();

  for (const filter of filters) {
    let re;
    try {
      re = new RegExp(filter.regex, 'igm');
    } catch (e) {
      // Invalid regular expression
      console.log(`Invalid RegExp: /${filter.message}/`);
    }

    if (!!re && re.test(message)) {
      client
        .timeout(channel, user, filter.timeout, filter.message)
        .catch((e) => {
          console.log(e);
        });
      return false;
    }
  }

  return true;
};

export default filterMessage;
