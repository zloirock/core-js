import _Map from "@core-js/pure/actual/map/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _getIterator from "@core-js/pure/actual/get-iterator";
// unlike `super[Symbol.iterator]`, `this[Symbol.iterator]` does the same lookup as the
// polyfill helper `getIterator(this)` - the own-defined override is still reached
class C extends _Map {
  [_Symbol$iterator]() {
    return _getIterator([]);
  }
  use() {
    return _getIterator(this);
  }
}