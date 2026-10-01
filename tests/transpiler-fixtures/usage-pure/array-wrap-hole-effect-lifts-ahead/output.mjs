import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Discarded wrapper slots still evaluate in source order before the property reads.
// Their effects remain in the captured array or lift with a fully consumed wrapper.
const log = [];
const rows = [[1, 2]];
const [, _ref] = [_pushMaybeArray(log).call(log, 'n'), (_pushMaybeArray(log).call(log, 'e'), _globalThis)];
const viaSurface = _atMaybeArray(_ref.Array.prototype);
const [, _ref2] = [_pushMaybeArray(log).call(log, 'm'), _flatMaybeArray(rows).call(rows)];
const viaMemo = _atMaybeArray(_ref2);
const {
  length: memoLength
} = _ref2;
const [, {
  Array: {
    prototype: {
      at: mixedInstance
    }
  },
  Object: {
    keys: mixedStatic
  },
  other
}] = [_pushMaybeArray(log).call(log, 'x'), {
  Array: {
    prototype: {
      at: _atMaybeArray(_globalThis.Array.prototype)
    }
  },
  Object: {
    keys: _Object$keys
  },
  other: _globalThis.other
}];
export const r = [typeof viaSurface, viaMemo(0), memoLength, typeof mixedInstance, typeof mixedStatic, typeof other, log.length];