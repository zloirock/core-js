import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A retained getter supplies a nested constructor between ordinary siblings.
// Its binding initializes before either trailing getter reads it.
// The exported constructor includes its static methods for external consumers.
const log = [];
const {
  before,
  box: {
    first,
    realm: {
      WeakSet: Value
    },
    last
  },
  after
} = {
  get before() {
    _pushMaybeArray(log).call(log, 'before');
    return 1;
  },
  get box() {
    _pushMaybeArray(log).call(log, 'box');
    return {
      get first() {
        _pushMaybeArray(log).call(log, 'first');
        return 2;
      },
      get realm() {
        _pushMaybeArray(log).call(log, 'realm');
        return {
          WeakSet: _WeakSet
        };
      },
      get last() {
        _pushMaybeArray(log).call(log, typeof Value);
        return 3;
      }
    };
  },
  get after() {
    _pushMaybeArray(log).call(log, typeof Value);
    return 4;
  }
};
export { before, first, Value, last, after };
export { log };