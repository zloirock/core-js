import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An opaque iterator keeps inner-default reads inside its step, before IteratorClose.
// Its pattern stays native in pure mode; global mode still injects the named static.
// The receiver is a local iterable whose first step yields undefined.
const events = [];
const iterable = {
  [_Symbol$iterator]() {
    return {
      next() {
        return {
          done: false,
          value: undefined
        };
      },
      return() {
        _pushMaybeArray(events).call(events, 'close');
        return {};
      }
    };
  }
};
const [{
  Array: {
    of
  },
  [(_pushMaybeArray(events).call(events, 'key'), 'missing')]: value
} = _globalThis] = iterable;
use(of, value, events);