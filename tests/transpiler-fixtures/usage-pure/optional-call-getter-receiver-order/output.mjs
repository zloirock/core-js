import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// A method-only optional call can invoke a getter that replaces its receiver binding.
// The call retains the object captured before that getter; the computed continuation
// runs exactly once on the value returned from the original receiver.
let arr = [['outer']];
const after = [['inner']];
Object.defineProperty(arr, 'at', {
  get() {
    arr = after;
    return function () {
      return this[0];
    };
  }
});
let hits = 0;
export const result = [null == (_ref = _atMaybeArray(_ref2 = arr)?.call(_ref2, 0)) ? void 0 : (hits++, _includes(_ref).call(_ref, 'outer')), hits];