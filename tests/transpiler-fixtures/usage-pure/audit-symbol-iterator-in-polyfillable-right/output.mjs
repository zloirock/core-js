import _isIterable from "@core-js/pure/actual/is-iterable";
import _Array$from from "@core-js/pure/actual/array/from";
// in-replacement splices `node.right` verbatim - the Array.from inside must still
// polyfill after TransformQueue composes the outer `_isIterable(...)` rewrite
_isIterable(_Array$from(src));