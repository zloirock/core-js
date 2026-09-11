import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// flatten + Symbol.iterator sibling + `...rest`: rest must EXCLUDE both consumed keys
// from the residual object, so the residual destructure emits two sentinels - `Array:
// _unused` and `[_Symbol$iterator]: _unused2`. the latter uses the polyfilled binding so
// engines without native `Symbol` still evaluate the key; residual init keeps user `obj`
const obj = _globalThis;
const from = _Array$from;
const iter = _getIteratorMethod(obj);
const {
  Array: _unused,
  [_Symbol$iterator]: _unused2,
  ...rest
} = obj;
console.log(from, iter, rest);