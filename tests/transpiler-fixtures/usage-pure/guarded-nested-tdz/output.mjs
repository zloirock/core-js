import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// The retained getter reads its own binding before initialization and must throw.
// A guarded constructor replacement cannot run early or reach the trailing getter.
const log = [];
let caught;
try {
  const {
    first,
    realm: {
      WeakSet: Value
    },
    last
  } = {
    get first() {
      _pushMaybeArray(log).call(log, 'first');
      return 1;
    },
    get realm() {
      _pushMaybeArray(log).call(log, 'realm');
      const type = typeof Value;
      _pushMaybeArray(log).call(log, type);
      return {
        WeakSet: _WeakSet
      };
    },
    get last() {
      _pushMaybeArray(log).call(log, 'last');
      return 2;
    }
  };
  _pushMaybeArray(log).call(log, first, last, Value);
} catch (error) {
  caught = _nameMaybeFunction(error);
}
export const result = [caught, log];