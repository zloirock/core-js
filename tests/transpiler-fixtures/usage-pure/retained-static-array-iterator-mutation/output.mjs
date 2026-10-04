import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A visible iterator write keeps both computed and plain static reads native.
const events = [];
const original = _Object$getOwnPropertyDescriptor(Array.prototype, _Symbol$iterator);
const foreign = {
  of() {
    _pushMaybeArray(events).call(events, 'foreign-of');
    return 'own-of';
  },
  from() {
    _pushMaybeArray(events).call(events, 'foreign-from');
    return 'own-from';
  },
  get length() {
    _pushMaybeArray(events).call(events, 'length');
    return 29;
  }
};
let result;
try {
  Array.prototype[_Symbol$iterator] = function () {
    _pushMaybeArray(events).call(events, 'iterator');
    return {
      next() {
        _pushMaybeArray(events).call(events, 'next');
        return {
          value: foreign,
          done: false
        };
      },
      return() {
        _pushMaybeArray(events).call(events, 'close');
        return {
          done: true
        };
      }
    };
  };
  const [{
    of: a,
    [(_pushMaybeArray(events).call(events, 'key'), 'from')]: b,
    length: c
  }] = [Array];
  result = [a(), b(), c];
} finally {
  _Object$defineProperty(Array.prototype, _Symbol$iterator, original);
}
export { result, events };