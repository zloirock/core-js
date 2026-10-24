import _Iterator$from from "@core-js/pure/actual/iterator/from";
// isolated `Iterator.prototype.forEach` - terminal consumer over Iterator.from seed
_Iterator$from([1, 2, 3]).forEach(x => console.log(x));