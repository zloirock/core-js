import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
const rows = [[1, 2]];
const [,,] = [_pushMaybeArray(log).call(log, 'n'), (_pushMaybeArray(log).call(log, 'e'), _globalThis)];
const viaSurface = _atMaybeArray(_globalThis.Array.prototype);
const [, _ref] = [_pushMaybeArray(log).call(log, 'm'), _flatMaybeArray(rows).call(rows)];
const viaMemo = _atMaybeArray(_ref);
const {
  length: memoLength
} = _ref;
const [,,] = [_pushMaybeArray(log).call(log, 'x'), _globalThis];
const mixedInstance = _atMaybeArray(_globalThis.Array.prototype);
const {
  Object: {
    keys: mixedStatic
  }
} = {
  Object: {
    keys: _Object$keys
  }
};
const {
  other
} = _globalThis;
export const r = [typeof viaSurface, viaMemo(0), memoLength, typeof mixedInstance, typeof mixedStatic, typeof other, log.length];