import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
export class Collection {
  static *[Symbol.iterator]() {
    yield this;
  }
  static first() {
    return this[Symbol.iterator]().next().value;
  }
}
const realm = globalThis;
export function remove() {
  return delete realm.self.custom;
}