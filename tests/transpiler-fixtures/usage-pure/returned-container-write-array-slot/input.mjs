// A definite store replaces the existing array slot before its static read.
function swap(box) { Reflect.set(box, 0, Map); return box; }
use(swap([Object])[0].groupBy([1, 2], x => x % 2));
