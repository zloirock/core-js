import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
// fixture-size: 32 -- The getter installs an iterator return accessor during the same parameter read. Installation, read and restoration must share one input to test that order.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
const events = [];
const rawArray = Function('return Array')();
const iteratorPrototype = _Object$getPrototypeOf(_getIterator([]));
const previousReturn = _Object$getOwnPropertyDescriptor(iteratorPrototype, 'return');
const previousSibling = _Object$getOwnPropertyDescriptor(rawArray, 'fc551ParameterSibling');
Object.defineProperty(rawArray, 'fc551ParameterSibling', {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'sibling');
    Object.defineProperty(_Object$getPrototypeOf(_getIterator([])), 'return', {
      configurable: true,
      get() {
        _pushMaybeArray(events).call(events, 'return');
        return function () {
          _pushMaybeArray(events).call(events, 'close');
          return {
            done: true
          };
        };
      }
    });
    return 17;
  }
});
function read([{
  of,
  [(_pushMaybeArray(events).call(events, 'key'), 'from')]: from,
  length,
  fc551ParameterSibling: sibling
}] = [Array]) {
  return [of(3)[0], from([4])[0], length, sibling];
}
let result;
try {
  result = read();
} finally {
  if (previousReturn) Object.defineProperty(iteratorPrototype, 'return', previousReturn);else delete iteratorPrototype.return;
  if (previousSibling) Object.defineProperty(rawArray, 'fc551ParameterSibling', previousSibling);else delete rawArray.fc551ParameterSibling;
}
export { result, events };