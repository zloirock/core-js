import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
// A visible realm getter write keeps a foreign constructor hop native and reads it once.
const events = [];
const original = _Object$getOwnPropertyDescriptor(_globalThis, 'Array');
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
  Object.defineProperty(_globalThis, 'Array', {
    configurable: true,
    get() {
      _pushMaybeArray(events).call(events, 'realm');
      return foreign;
    }
  });
  const [{
    Array: {
      of: a,
      [(_pushMaybeArray(events).call(events, 'key'), 'from')]: b,
      length: c
    }
  }] = [_globalThis];
  result = [a(), b(), c];
} finally {
  Object.defineProperty(_globalThis, 'Array', original);
}
export { result, events };