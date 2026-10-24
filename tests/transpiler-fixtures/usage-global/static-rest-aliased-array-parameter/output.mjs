import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Closed parameter binding copies enumerable rest keys, not the constructor's standard statics.
// Global needs only from; pure retains the supplied receiver and native parameter reads.
const source = [Array];
function read([{
  from,
  ...rest
}]) {
  return from([1]);
}
export const result = read(source);
export const intact = source[0] === Array;