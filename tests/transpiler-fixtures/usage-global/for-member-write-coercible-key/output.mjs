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
// A const object can select a different property on each key coercion.
const values = [[], [3, 4]];
let index = 0;
const key = {
  toString() {
    return String(index);
  }
};
for (values[key].at of [0]) {
  index = 1;
  consume(values[key].at(-1));
}