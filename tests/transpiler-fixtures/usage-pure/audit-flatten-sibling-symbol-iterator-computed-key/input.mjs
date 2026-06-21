// flatten on inner `from` plus a sibling `[Symbol.iterator]: iter` computed key: the
// destructure splits into two extractions (`from` and `iter = _getIteratorMethod(obj)`).
// the receiver `obj` aliases `globalThis`, so the receiver slice must survive the rewrite
// while the unrelated `globalThis -> _globalThis` substitution still applies in its own statement
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: iter } = obj;
console.log(from, iter);
