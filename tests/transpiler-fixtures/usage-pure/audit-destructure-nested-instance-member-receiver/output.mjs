import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a nested-object destructure of an instance method whose receiver is a side-effect-free MEMBER
// (`Array.prototype`). when the method is the SOLE binding and the init is pure, the residual is
// eliminated and the extraction reads the receiver exactly ONCE - a getter fires once, like native.
// a SURVIVING residual (a sibling binding) would re-read the receiver beside the extraction, so a
// member receiver stays native in the second declaration (double-read protection) - no injection.
const at = _atMaybeArray(Array.prototype);
const {
  p: {
    flat: m
  },
  q
} = {
  p: Array.prototype,
  q: 1
};
export const r = [typeof at, typeof m, q];
export const effects = [];