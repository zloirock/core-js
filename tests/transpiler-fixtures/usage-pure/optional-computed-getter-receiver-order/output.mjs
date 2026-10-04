import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// Quiet computed method keys preserve the source receiver's exact hint set.
// Both optional-call forms capture that receiver before a getter replaces its binding;
// the quoted key introduces no effect to rescue when the instance lookup is emitted.
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
export const doubleOptional = null == (_ref = arr) || null == (_ref2 = _atMaybeArray(_ref)?.call(_ref, 0)) ? void 0 : _includes(_ref2).call(_ref2, 'outer');
let other = [['first']];
const later = [['second']];
Object.defineProperty(other, 'at', {
  get() {
    other = later;
    return function () {
      return this[0];
    };
  }
});
export const callOptional = _atMaybeArray(_ref3 = other)?.call(_ref3, 0)?.indexOf('first');