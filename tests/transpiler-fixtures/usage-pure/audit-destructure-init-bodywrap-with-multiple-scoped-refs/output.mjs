import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
(() => {
  var _ref2, _ref4;
  return ((() => {
    var _ref;
    var z1 = _atMaybeArray(_ref = [1]).call(_ref, 0);
    return z1;
  })(), _atMaybeArray(_ref2 = [2]).call(_ref2, 0)) + ((() => {
    var _ref3;
    var z2 = _atMaybeArray(_ref3 = [3]).call(_ref3, 0);
    return z2;
  })(), _atMaybeArray(_ref4 = [4]).call(_ref4, 0));
})();
// outer arrow body-wrap absorbing TWO scopedVar inserts from two sibling inner blocks.
// pins the multi-scopedVar branch of #composeBodyWrapText: scopedVars sorted descending by
// start so each splice's local offset stays valid through the loop. without sort, the
// second splice's localStart references a shifted position after the first splice extended
// the slice
const from = _Array$from;
console.log(from);