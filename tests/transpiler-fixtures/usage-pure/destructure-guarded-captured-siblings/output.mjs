import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _keys from "@core-js/pure/actual/instance/keys";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Capturing a guarded static keeps earlier instance and declarator claims live.
// The user object is not a realm alias: its getters run once in source order.
// The Array getter proves the prototype family, so the instance claim needs no String polyfill.
export function captured(log) {
  const source = {
    get Array() {
      _pushMaybeArray(log).call(log, 'Array');
      return Array;
    },
    get Object() {
      _pushMaybeArray(log).call(log, 'Object');
      return Object;
    },
    get other() {
      _pushMaybeArray(log).call(log, 'other');
      return 7;
    }
  };
  let held;
  const from = _Array$from;
  const _ref = held = (_pushMaybeArray(log).call(log, 'source'), source);
  const at = _atMaybeArray(_ref.Array.prototype);
  const {
    Object: _ref2
  } = _ref;
  const keys = _ref2 === Object ? _Object$keys : _keys(_ref2);
  const {
    other
  } = _ref;
  return [from('ab'), at.call([4, 8], -1), keys({
    a: 1
  }), other, held === source];
}