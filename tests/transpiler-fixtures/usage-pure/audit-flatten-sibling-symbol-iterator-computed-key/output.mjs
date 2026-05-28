import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// Flatten on inner `from` together with a sibling `[Symbol.iterator]: iter` computed
// key. The destructure is fully consumed into two independent extractions, one for
// `from` and one for `iter = _getIteratorMethod(receiver)`. The receiver binding `obj`
// is itself an alias of `globalThis`, so the receiver-slice must survive intact through
// the rewrite while the unrelated `globalThis -> _globalThis` substitution still applies
// inside its own statement. If either composition fails, one of the bindings ends up
// referencing an unpolyfilled global and crashes at runtime.
const obj = _globalThis;
const from = _Array$from;
const iter = _getIteratorMethod(obj);
console.log(from, iter);