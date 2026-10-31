import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.at";
// computed class method key with Symbol prevents static narrowing of `s.items` to the getter return;
// surrounding Symbol() call still triggers symbol constructor + description polyfills
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