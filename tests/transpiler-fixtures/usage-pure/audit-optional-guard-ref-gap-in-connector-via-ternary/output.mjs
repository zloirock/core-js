import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// A ternary CONSUMES the guarded chain: the root-boundary gate accepts the chain inside the
// test position, and the guard-memo wraps only the chain, not the branches.
const k = {
  l: [[8]]
};
export const viaTernary = (null == (_ref = k.l) ? void 0 : _flatMaybeArray(_ref).call(_ref, 0)) ? _flatMaybeArray(_ref2 = k.l).call(_ref2, 1) : null;