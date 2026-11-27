import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A subtype can add a symbol property with an array value beside a string index signature.
const key = Symbol('rows');
function read<T extends Record<string, string>>(o: T, k: keyof T) {
  return o[k].includes('a');
}
export const result = read({
  name: 'test',
  [key]: ['ab']
}, key);