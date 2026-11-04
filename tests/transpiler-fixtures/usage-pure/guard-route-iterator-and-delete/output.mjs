import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
export class Collection {
  static *[_Symbol$iterator]() {
    yield this;
  }
  static first() {
    return _getIterator(this).next().value;
  }
}
const realm = _globalThis;
export function remove() {
  return delete realm.custom;
}