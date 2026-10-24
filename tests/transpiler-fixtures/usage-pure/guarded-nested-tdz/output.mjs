import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
let caught;
try {
  const _ref = {
      get first() {
        _pushMaybeArray(log).call(log, 'first');
        return 1;
      },
      get realm() {
        _pushMaybeArray(log).call(log, 'realm');
        const type = typeof Value;
        _pushMaybeArray(log).call(log, type);
        return _globalThis;
      },
      get last() {
        _pushMaybeArray(log).call(log, 'last');
        return 2;
      }
    },
    {
      first
    } = _ref,
    {
      realm: _ref2
    } = _ref,
    Value = _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet,
    {
      last
    } = _ref;
  _pushMaybeArray(log).call(log, first, last, Value);
} catch (error) {
  caught = _nameMaybeFunction(error);
}
export const result = [caught, log];