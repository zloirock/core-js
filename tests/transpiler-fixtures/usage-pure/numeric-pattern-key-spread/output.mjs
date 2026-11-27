import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An unresolved numeric slot keeps the runtime owner of Array.from.
const shifted = [...src, _globalThis];
const {
  0: unknown
} = shifted;
export const alsoKept = (_ref = unknown.Array, _ref === Array ? _Array$from([1]) : _ref.from([1]));