import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a defaulted instance read off an optional member dispatches as off the plain member: the `?.` read is one
// member in both dialects, and the guard keeps the default for an undefined dispatch
export const {
  flat = null
} = box?.list;
export const {
  at = null
} = box?.['items'];
let includes;
({
  includes = null
} = box?.text);
export { includes };