import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// flatten on inner `from` plus a sibling `[Symbol.iterator]: iter` computed key: the
// destructure splits into two extractions (`from` and `iter = _getIteratorMethod(obj)`).
// the receiver `obj` aliases `globalThis`, so the receiver slice must survive the rewrite
// while the unrelated `globalThis -> _globalThis` substitution still applies in its own statement
const obj = _globalThis;
const {
  Array: {
    from
  },
  [_Symbol$iterator]: iter
} = {
  Array: {
    from: _Array$from
  },
  [_Symbol$iterator]: _getIteratorMethod(_globalThis)
};
console.log(from, iter);