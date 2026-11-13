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
// A bound hop in a captured array element keeps the method extraction on assignment.
const K = 'row';
const source = [{
  row: [3, 7]
}];
let at;
[{
  [K]: {
    at
  }
}] = source;
export const result = at.call([3, 7], -1);