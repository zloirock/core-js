// Flatten on inner `from` together with a sibling `[Symbol.iterator]: iter` computed
// key. The destructure is fully consumed into two independent extractions, one for
// `from` and one for `iter = _getIteratorMethod(receiver)`. The receiver binding `obj`
// is itself an alias of `globalThis`, so the receiver-slice must survive intact through
// the rewrite while the unrelated `globalThis -> _globalThis` substitution still applies
// inside its own statement. If either composition fails, one of the bindings ends up
// referencing an unpolyfilled global and crashes at runtime.
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: iter } = obj;
console.log(from, iter);
