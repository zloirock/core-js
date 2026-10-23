// Several already extracted properties write one private target beside their values.
// Reprocessing must keep these residual reads and must not allocate another target.
import arrayFrom from "@core-js/pure/actual/array/from";
import arrayOf from "@core-js/pure/actual/array/of";
var _unused, rest;
const first = arrayFrom, second = arrayOf;
({ from: _unused, of: _unused, ...rest } = Array);
use(first, second, rest);
