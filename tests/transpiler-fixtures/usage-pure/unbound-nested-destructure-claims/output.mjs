import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Quiet unbound names need no receiver capture. Nested property reads still occur once,
// and the instance extraction and its live leaf default stay available on the first pass.
const known = [1, [2]];
let method, flat;
method = _at(unknown);
flat = _flatMaybeArray(known);
const [,] = [box];
const includes = (_ref = _includes(box.y)) === void 0 ? makeFallback() : _ref;
export { method, flat, includes };