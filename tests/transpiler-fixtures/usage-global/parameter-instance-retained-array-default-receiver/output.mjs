import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A retained parameter default keeps the prototype receiver's method family.
// The computed key and native sibling consume the captured receiver in source order.
const events = [];
function read([[{
  at: first,
  [(events.push('key'), 'flat')]: second,
  length
}]] = [[Array.prototype]]) {
  return [typeof first, typeof second, events.join(',')];
}
export const result = read();