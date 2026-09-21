import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// Abstract constructors are function values too; their own map reads need no Array dispatcher.
// Reading an iterator instance's map remains a separate, polyfillable operation.
export const own = [typeof _Iterator.map, typeof AsyncIterator.map];
export const mapped = _Iterator$from([1, 2]).map(value => value + 1).toArray();