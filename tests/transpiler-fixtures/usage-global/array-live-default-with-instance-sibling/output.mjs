import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A live receiver default retains its native read beside an independently polyfilled instance leaf.
const [{
  isArray
} = Array, {
  at
}] = [undefined, [7, 8]];
export const result = [isArray([]), at.call([7, 8], -1)];