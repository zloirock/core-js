import _Iterator$from from "@core-js/pure/actual/iterator/from";
// isolated `Iterator.prototype.drop` on an `Iterator.from`-seeded iterator
_Iterator$from([1, 2, 3]).drop(1);