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
// A nested iterator position owns the method receiver and keeps the key once.
function key() {
  effect();
  return "at";
}
function* values() {
  yield [[7, 8]];
}
const [[{
  [key()]: at
}]] = values();
export { at };