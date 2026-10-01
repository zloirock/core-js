import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const obj = _globalThis;
const from = _Array$from;
const {
  Array: _unused,
  [_Symbol$iterator]: iter,
  ...rest
} = obj;
console.log(from, iter, rest);