import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `(a?.b.c).at(0)` - mid-chain optional: the first hop is optional, the second non-optional,
// but the whole subexpression is wrapped in a ChainExpression on oxc / a single
// OptionalMemberExpression on babel. without peeling the wrapper inside the chain walk, oxc
// bails at the wrapper and the typed-array `at` path is missed, while babel continues to
// resolve and emits the array-specific helper
declare const a: {
  b: {
    c: number[];
  };
};
_atMaybeArray(_ref = a?.b.c).call(_ref, 0);