import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A present array element receives its instance polyfill after the initializer prefix.
// The element default stays conditional and does not stand in for the present receiver.
// The array slot and empty default admit no string receiver.
let effects = 0;
const wrapper = [[1, 2]];
let at;
[{
  at
} = {}] = (effects++, wrapper);