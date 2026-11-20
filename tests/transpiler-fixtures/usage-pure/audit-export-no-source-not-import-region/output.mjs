import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A named export without a source ends the import header. Receiver temporaries go before it.
import { argv, execArgv } from 'node:process';
var _ref, _ref2;
export { argv, execArgv };
function argumentLists() {
  return [execArgv, argv];
}
const first = _atMaybeArray(_ref = argumentLists()).call(_ref, 0);
const all = _flatMaybeArray(_ref2 = argumentLists()).call(_ref2);