import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Computed class member keys use the enclosing this; values use the class receiver.
class C {
  [this.Symbol.iterator]() {
    return this;
  }
  [this.Array.from([1])[0]] = this;
  static [this.Object.assign({}, {
    key: 'value'
  }).key] = this;
}