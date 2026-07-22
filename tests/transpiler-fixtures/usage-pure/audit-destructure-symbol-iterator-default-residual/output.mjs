import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// a `[Symbol.iterator]`-keyed prop whose value carries a polyfillable default must expose that
// default to the rewrite: without a residual anchor the blanket flatten skip drops it and the
// default leaks a native instance call
const from = _Array$from;
const {
  [_Symbol$iterator]: it = _atMaybeArray(_ref = [1]).call(_ref, 0)
} = _globalThis;
export { from, it };