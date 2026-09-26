import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// the LAST declaration for an object-literal key decides its type (later members override). a setter
// as that last declaration makes the key a setter-only accessor whose read yields undefined, so the
// shadowed earlier data property must NOT narrow the access - it bails to the generic instance helper.
// a getter+setter PAIR is different: reading yields the getter's value, which keeps its precise narrow.
const shadowed = {
  list: [1, 2],
  set list(v) {}
};
const paired = {
  get list() {
    return [1, 2];
  },
  set list(v) {}
};
export const a = _at(_ref = shadowed.list).call(_ref, 0);
export const b = _includesMaybeArray(_ref2 = paired.list).call(_ref2, 1);