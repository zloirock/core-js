import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A leading spread can supply a parameter even when its source literal is empty.
// The caller's later true does not decide this parameter's receiver selection.
Array.prototype[Symbol.iterator] = function* () {
  yield false;
};
function read(flag) {
  return (flag ? [1] : 'text').includes('e');
}
export const result = read(...[], true);