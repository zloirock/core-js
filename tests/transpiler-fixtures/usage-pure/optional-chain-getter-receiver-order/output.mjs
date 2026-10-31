import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// An optional method lookup can invoke a getter that replaces its receiver binding.
// The following call retains the object captured before that getter, and its result
// continues through the guarded computed member exactly once.
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
export const result = [null == (_ref = arr) || null == (_ref2 = _atMaybeArray(_ref)?.call(_ref, 0)) ? void 0 : (hits++, _includes(_ref2).call(_ref2, 'outer')), hits];