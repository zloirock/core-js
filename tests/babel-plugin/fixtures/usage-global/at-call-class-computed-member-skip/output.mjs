import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.at";
const items = Symbol();
class Store {
  [items]() {
    return [1, 2];
  }
  get items() {
    return 'hello';
  }
}
const s = new Store();
s.items.at(0);