import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// one receiver, one spelling: the probe memo the claim channel builds does not depend on how the
// ROOT is written. read plainly off an alias it memoizes, and the destructuring read of the same
// navigation owes the same memo - collapsing the alias spelling to the ponyfill instead answered
// off a different object than the bare twin one line down
const ga = _globalThis;
export const {
  trunc: aliased
} = null == (_ref = ga.window) ? void 0 : _atMaybeArray(_ref.Array.prototype).Math;
export const {
  trunc: bare
} = null == (_ref2 = _globalThis.window) ? void 0 : _atMaybeArray(_ref2.Array.prototype).Math;
export const read = null == (_ref3 = ga.window) ? void 0 : _atMaybeArray(_ref3.Array.prototype);