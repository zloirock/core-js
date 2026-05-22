import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// optional-chain hop produces an intermediate ChainExpression on oxc, flat
// OptionalMemberExpression on babel. without peeling the intermediate wrapper inside the
// chain walk, oxc bails out at the wrapper and the `at` polyfill is missed for the
// typed array path, while babel continues to resolve and emits the array-specific helper
declare const data: {
  items: number[];
};
_atMaybeArray(_ref = data?.items).call(_ref, 0);