import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a PAREN-SEALED undefinable nav as a chain root: the seal ends the inner chain, so the outer
// `?.` guards the sealed VALUE - which CAN be undefined (the live inner `?.` tests an
// unresolvable window read). the claim renders GUARDED with the canonical nested test; eating
// the guard ran the branch where native short-circuits (a wrong value off-browser)
export const viaSealedOptTail = null == _globalThis.window ? void 0 : _atMaybeArray(_ref = _Array$of(3)).call(_ref, 0);