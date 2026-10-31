import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a parameter holds the caller's value until a write replaces it, and a function declaration reading it
// may run before that write wherever the source spells it: a key the parameter selects after an early
// call stays the caller's, whether one write or a complete branching construct replaces it. a read
// after the write takes the iterator method
export function settled(target, key) {
  const early = read();
  if (typeof _Symbol != 'undefined') key = _Symbol$iterator;else key = '@@iterator';
  function read() {
    return target[key];
  }
  return early;
}
export function written(target, key) {
  const early = read();
  key = _Symbol$iterator;
  function read() {
    return target[key];
  }
  return early;
}
export function late(target, key) {
  if (typeof _Symbol != 'undefined') key = _Symbol$iterator;else key = '@@iterator';
  return _getIteratorMethod(target);
}