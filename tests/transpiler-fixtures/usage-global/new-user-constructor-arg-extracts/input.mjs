// bare method extracts and a well-known-symbol read as `new` arguments: import-only
// injection (MIGHT-bias) - the constructor callee and the argument text stay untouched
const t1 = new Tag(arr.at, 'x');
const t2 = new Tag(list[Symbol.iterator], 'y');
const t3 = new Tag(...items.flat, 'z');
