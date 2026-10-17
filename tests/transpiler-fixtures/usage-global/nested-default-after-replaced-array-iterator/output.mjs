import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested slot default does not identify what a changed iterator supplies.
// Global keeps the generic instance claim; pure retains native array destructuring.
Array.prototype[Symbol.iterator] = function* () {
  yield 'xy';
};
const [{
  includes
} = [1]] = [];
export const result = includes.call('xy', 'xy');