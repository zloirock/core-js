import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// optional chain on `arr` followed by computed `Symbol.iterator` call and a continuing
// `?.next?.()` chain. plugin rewrites the iterator extraction (`?.[Symbol.iterator]?.()`
// -> `_getIteratorMethod(arr)?.call(arr)`) but the `?.next?.()` continuation is plain
// user method access - left untouched and reachable only when the iterator call returns
// a non-nullish iterator
const result = (arr == null ? void 0 : _getIteratorMethod(arr)?.call(arr))?.next?.();