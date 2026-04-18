// in-replacement splices `node.right` verbatim - the Array.from inside must still
// polyfill after TransformQueue composes the outer `_isIterable(...)` rewrite
Symbol.iterator in Array.from(src);