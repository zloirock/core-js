import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// THREE-LEVEL nesting: outer arrow body-wrap contains middle arrow body-wrap which contains
// inner block scopedVar. each level absorbs its OWN direct scopedVars and direct child wraps;
// inner block's scopedVar passes through to its own enclosing wrap's recursive compose, not
// landing at the outer level. pins the recursive directScopedVars filter that excludes
// scopedVars inside a nested wrap (they would otherwise double-emit at outer level)
(() => { var _ref3; return (
  (() => { var _ref2; return (
    ((() => {
var _ref; var z = _atMaybeArray(_ref = [1]).call(_ref, 0); return z; })(), _atMaybeArray(_ref2 = [2]).call(_ref2, 0))
  ); })()
    + _atMaybeArray(_ref3 = [3]).call(_ref3, 0)
); })();
const from = _Array$from;
console.log(from);