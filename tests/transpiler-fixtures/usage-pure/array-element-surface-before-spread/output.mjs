import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A fixed first element can be captured before an opaque trailing spread iterates.
// Its nested instance read retains the Array polyfill and the spread's effects.
let visits = 0;
const tail = {
  [_Symbol$iterator]() {
    visits++;
    return _getIterator([1]);
  }
};
const [_ref] = [_globalThis, ...tail];
const at = _atMaybeArray(_ref.Array.prototype);
export { at, visits };