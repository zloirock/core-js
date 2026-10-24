import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `(a?.b?.c).at(0)` - two-hop optional chain inside the intermediate. on oxc this produces a
// nested ChainExpression wrapping multiple OptionalMemberExpression hops; on babel it flattens
// into a single OptionalMemberExpression. without peeling each ChainExpression wrapper along
// the chain walk, oxc bails at the wrapper and the typed-array `at` path is missed, while
// babel continues and emits the array-specific helper
declare const a: {
  b?: {
    c: number[];
  };
};
_atMaybeArray(_ref = a?.b?.c).call(_ref, 0);