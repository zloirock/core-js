import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a polyfilled call hosted by a SpreadElement - array-literal element and call-argument
// positions both trigger the method injection plus the spread's own iterator machinery
const arr = [1, [2]];
export const a = [...arr.flat()];
function f(...xs) {
  return xs;
}
export const b = f(...arr.at(0));