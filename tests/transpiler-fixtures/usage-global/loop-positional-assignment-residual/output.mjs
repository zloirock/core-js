import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Each loop iteration assigns the selected array method and its native length from the same element.
// Pure captures the instance receiver; global injection leaves the source assignment in the head.
let at, length;
const readers = [];
for ([{
  at,
  length
}] of [[[4, 5]], [[6, 7, 8]]]) readers.push([at.call([9], 0), length]);
export { at, length, readers };