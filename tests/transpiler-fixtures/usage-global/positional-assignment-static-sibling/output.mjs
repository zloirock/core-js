import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A positional capture keeps the preceding static claim live at its replacement path.
const array = [2, 7],
  rows = [Object, array];
let keys, at;
[{
  keys
}, {
  at
}] = rows;
export const result = [keys({
  x: 1
}), at.call(array, -1)];