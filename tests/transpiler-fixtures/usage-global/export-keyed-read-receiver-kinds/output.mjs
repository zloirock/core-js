import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// In usage-global the exported computed keys stay native: a known constructor injects its static, an
// opaque value the key's instance modules, and a reassigned alias or a member read holds no known
// constructor at the read and injects nothing for the static.
let A = Array;
A = pick();
const maybe = pick();
export const {
  [(effectful(), 'from')]: viaKnown
} = Array;
export const {
  [(effectful(), 'of')]: viaReassigned
} = A;
export const {
  [(effectful(), 'at')]: viaUnknown
} = maybe;
export const {
  [(effectful(), 'fromAsync')]: viaMember
} = holder.ctor;