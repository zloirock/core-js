import _from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _of from "@core-js/pure/actual/array/of";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
// A visible late return accessor keeps IteratorClose around the original native reads.
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
  of = _of;
  from = _from;
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