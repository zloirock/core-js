// A named export without a source ends the import header. Receiver temporaries go before it.
import { argv, execArgv } from 'node:process';
export { argv, execArgv };

function argumentLists() {
  return [execArgv, argv];
}

const first = argumentLists().at(0);
const all = argumentLists().flat();
