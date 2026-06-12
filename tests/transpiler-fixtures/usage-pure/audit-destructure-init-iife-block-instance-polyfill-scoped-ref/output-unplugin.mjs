import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// destructure init = SE-tail-to-known-static (`(..., Array).from`) so polyfill fires on
// the outer destructure. SE prefix = nested IIFE whose OUTER arrow has EXPRESSION body
// (registers a body-wrap inside the init range) wrapping an INNER arrow with BLOCK body
// containing `[1].at(0)` (registers a scoped `var _z;` decl inside the same range). the
// outer-polyfill replace must absorb the inner scoped var into the composed body-wrap
// text - otherwise the inner insert lands inside the outer's overwrite range and drops
(() => { var _ref2; return ((() => {
var _ref; var z = _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0); return z; })(), _atMaybeArray(_ref2 = [4, 5, 6]).call(_ref2, 0)); })();
const from = _Array$from;
console.log(from);