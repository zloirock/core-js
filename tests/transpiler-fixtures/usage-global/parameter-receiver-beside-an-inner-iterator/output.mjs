import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Only the outer argument list is iterated. An own iterator on its Array receiver
// does not change the value supplied by the pristine outer literal spread.
const value = [1];
value[Symbol.iterator] = function* () {
  yield 'text';
};
function read({
  at
}) {
  return at.call([7], 0);
}
export const result = read(...[value]);