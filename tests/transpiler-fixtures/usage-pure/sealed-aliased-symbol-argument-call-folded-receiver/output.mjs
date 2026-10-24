import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// Symbol-key consumption retains its selected receiver, call effects and argument order.
// Effectful realm keys stay inside the original receiver access.
const key = _Symbol$iterator;
function getRealm() {
  setup();
  return _globalThis;
}
export const result = (null == (_ref = getRealm()[hop(), 'self']) ? void 0 : _getIteratorMethod(_ref)).call(_ref, 42);