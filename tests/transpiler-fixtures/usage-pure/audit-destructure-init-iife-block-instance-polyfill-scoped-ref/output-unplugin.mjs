import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// destructure init is an SE-tail-to-known-static (`(..., Array).from`), so polyfill fires on
// the outer destructure. the SE prefix is a nested IIFE: an outer expression-body arrow wraps
// an inner block-body arrow whose `[1].at(0)` needs a scoped `var _z;`. the outer replace must
// absorb that inner scoped var, else the inner insert lands inside the overwrite range and drops.
(() => { var _ref2; return ((() => {
var _ref; var z = _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0); return z; })(), _atMaybeArray(_ref2 = [4, 5, 6]).call(_ref2, 0)); })();
const from = _Array$from;
console.log(from);