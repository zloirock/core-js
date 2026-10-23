import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// Several already extracted properties write one private target beside their values.
// Reprocessing must keep these residual reads and must not allocate another target.
import arrayFrom from "@core-js/pure/actual/array/from";
import arrayOf from "@core-js/pure/actual/array/of";
var _unused, rest;
const first = arrayFrom,
  second = arrayOf;
({
  from: _unused,
  of: _unused,
  ...rest
} = Array);
use(first, second, rest);