import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
(() => {
  var _ref2;
  return (() => {
    var _ref;
    var z = _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0);
    return z;
  })(), _atMaybeArray(_ref2 = [4, 5, 6]).call(_ref2, 0);
})();
// destructure init = SE-tail-to-known-static (`(..., Array).from`) so emitPolyfilled fires.
// SE prefix = nested IIFE whose OUTER arrow has EXPRESSION body (registers bodyWrap inside
// init range) wrapping an INNER arrow with BLOCK body containing `[1].at(0)` (registers
// scopedVar at inner block start, also inside init range). consumeRefBindingsInRange returns
// BOTH bodyWrap splice (overwriting outer arrow body range) AND scopedVar splice (insert
// inside that same range). pins the absorb-scopedVar-into-composed-bodyWrap fix in
// scope-tracker - without it, spliceInRange's bodyWrap overwrite discards the scopedVar
// insertion since splice bounds remain in original-source coordinates
const from = _Array$from;
console.log(from);