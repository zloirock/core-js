import _Iterator$from from "@core-js/pure/actual/iterator/from";
// isolated `Iterator.prototype.reduce` - terminal aggregator over Iterator.from seed
_Iterator$from([1, 2, 3]).reduce((a, b) => a + b, 0);