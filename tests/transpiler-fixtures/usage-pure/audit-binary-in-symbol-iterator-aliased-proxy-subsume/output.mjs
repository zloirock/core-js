import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// const-aliased proxy global on the iterator-probe receiver chain. without
// alias-following on the leaf, the inner identifier escapes the handled-set
// and the inner visitor queues a parallel rewrite that overlaps the outer
// _isIterable polyfill - text-emit pipelines fail the partial-overlap assertion
const g = _globalThis;
const r = _isIterable(arr);
[r];