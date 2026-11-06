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
// A changed outer array iterator supplies the parameter's actual receiver.
// Its literal element cannot prove an Array-only instance helper.
Array.prototype[Symbol.iterator] = function* () {
  yield 'text';
};
function read({
  at
}) {
  return at.call('ok', 0);
}
export const result = read(...[[1]]);