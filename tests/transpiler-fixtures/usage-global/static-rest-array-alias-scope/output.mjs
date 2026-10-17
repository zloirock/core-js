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
// The element was captured before the alias changed and outside the parameter shadow.
let A = Array;
const source = [A];
A = {
  from: () => 9
};
function read(A) {
  const [{
    from,
    ...rest
  }] = source;
  return from([1]);
}
export const result = read(A);