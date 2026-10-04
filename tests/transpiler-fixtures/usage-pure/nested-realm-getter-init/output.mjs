import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// A realm getter behind a sequence prefix is evaluated once for several nested leaves.
// The quiet surface retains its normal reusable navigation.
const log = [];
const A = Array;
Object.defineProperty(_globalThis, 'Array', {
  configurable: true,
  get() {
    _pushMaybeArray(log).call(log, 'Array');
    return A;
  }
});
const {
    prototype: _ref
  } = (_pushMaybeArray(log).call(log, 'prefix'), _globalThis.Array),
  at = _at(_ref),
  values = _values(_ref);
export { at, values, log };