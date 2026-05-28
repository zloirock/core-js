// const-aliased proxy global on the iterator-probe receiver chain. without
// alias-following on the leaf, the inner identifier escapes the handled-set
// and the inner visitor queues a parallel rewrite that overlaps the outer
// _isIterable polyfill - text-emit pipelines fail the partial-overlap assertion
const g = globalThis;
const r = g.Symbol.iterator in arr;
[r];
