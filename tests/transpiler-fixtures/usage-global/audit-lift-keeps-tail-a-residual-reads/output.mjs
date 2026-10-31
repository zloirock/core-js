import "<CWD>/packages/core-js/modules/es.symbol.constructor.js";
import "<CWD>/packages/core-js/modules/es.symbol.description.js";
import "<CWD>/packages/core-js/modules/es.object.assign.js";
import "<CWD>/packages/core-js/modules/es.object.get-own-property-symbols.js";
import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.promise.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.catch.js";
import "<CWD>/packages/core-js/modules/es.promise.finally.js";
import "<CWD>/packages/core-js/modules/es.promise.resolve.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.array.from-async.js";
import "<CWD>/packages/core-js/modules/es.array.at.js";
import "<CWD>/packages/core-js/modules/es.array.from.js";
import "<CWD>/packages/core-js/modules/es.array.of.js";
import "<CWD>/packages/core-js/modules/es.function.name.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
// the dead-tail lift drops a sequence tail whose value nothing reads, and usage-global observes it
// only through the import set: each row's own method is its evidence, and the rest sibling, copying
// no static of a constructor core-js does not polyfill, adds none. the lift and the residual read
// are rewrites - the pure sibling is where they are visible
const arr = [1];
export const {
  of,
  name
} = (0, Array);
export const {
  at
} = (0, arr);
export const {
  from
} = (0, Array);
export const {
  fromAsync,
  ...rest
} = (0, Array);