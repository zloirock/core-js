import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// intersection of two collapse behaviors: a `||` fallback receiver whose left has a POLYFILLABLE
// instance-method prefix (`[1].at(0)`) AND an UNRESOLVED sibling key (`isArray`). the receiver is
// memoized (the prefix runs once inside the memo argument and is itself polyfilled), the unresolved
// sibling reads the memo, and the dead right operand is dropped - no double-eval, import set minimal
function g({
  from,
  isArray
} = function (_ref2) {
  return {
    from: _Array$from,
    isArray: _ref2.isArray
  };
}((_atMaybeArray(_ref = [1]).call(_ref, 0), Array))) {
  return [from([1]), isArray([])];
}
g();