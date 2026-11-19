import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Native iteration captures the element before its effectful method key is dispatched.
function key() {
  effect();
  return "at";
}
function* values() {
  yield [7, 8];
}
const [{
  [key()]: at
}] = values();
export { at };