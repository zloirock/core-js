import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Four-deep optional chain whose inner method is polyfillable: findChainRoot must
// emit a single `_ref` memoization for the entire object span, with `?.` collapsed
// across every link so the polyfill receives the chained value (not raw source).
null == (_ref = a?.b?.c?.d) ? void 0 : _at(_ref).call(_ref, 0);