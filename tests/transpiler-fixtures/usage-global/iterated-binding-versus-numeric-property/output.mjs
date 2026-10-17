import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An ArrayPattern consumes the current iterator. A numeric ObjectPattern key
// reads an indexed property and retains its independent Array family.
Array.prototype[Symbol.iterator] = function* () {
  yield 'text';
};
const [value] = [[1]];
export const iterated = value.at(0);
const {
  0: indexed
} = [[1]];
export const property = indexed.includes(1);