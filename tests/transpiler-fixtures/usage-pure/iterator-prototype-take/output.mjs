import _Iterator$from from "@core-js/pure/actual/iterator/from";
// isolated `Iterator.prototype.take` — `.take(n)` on a polyfilled Iterator seed should
// route through the Iterator prototype polyfill without extra chained helpers
_Iterator$from([1, 2, 3]).take(2);