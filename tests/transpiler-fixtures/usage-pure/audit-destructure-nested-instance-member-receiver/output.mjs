import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nested-object destructure of an instance method whose receiver is a side-effect-free MEMBER
// (`Array.prototype`). when the method is the SOLE binding and the init is pure, the residual is
// eliminated and the extraction reads the receiver exactly ONCE - a getter fires once, like native.
// a SURVIVING residual (a sibling binding) MEMOIZES the receiver instead: the residual and the
// extraction both read the shared binding, so a getter still fires exactly once and the polyfill lands.
const at = _atMaybeArray(Array.prototype);
const _ref = Array.prototype;
const m = _flatMaybeArray(_ref);
const {
  p: {
    flat: _unused
  },
  q
} = {
  p: _ref,
  q: 1
};
export const r = [typeof at, typeof m, q];
export const effects = [];