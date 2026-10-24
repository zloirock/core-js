import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Symbol-key consumption retains its selected receiver, call effects and argument order.
// Effectful realm keys stay inside the original receiver access.
const key = _Symbol$iterator;
function getRealm() {
  setup();
  return _globalThis;
}
export const result = _getIterator(getRealm()[hop(), 'self']);