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
import "<CWD>/packages/core-js/modules/es.array.concat.js";
import "<CWD>/packages/core-js/modules/es.array.copy-within.js";
import "<CWD>/packages/core-js/modules/es.array.entries.js";
import "<CWD>/packages/core-js/modules/es.array.fill.js";
import "<CWD>/packages/core-js/modules/es.array.filter.js";
import "<CWD>/packages/core-js/modules/es.array.find.js";
import "<CWD>/packages/core-js/modules/es.array.find-index.js";
import "<CWD>/packages/core-js/modules/es.array.find-last.js";
import "<CWD>/packages/core-js/modules/es.array.find-last-index.js";
import "<CWD>/packages/core-js/modules/es.array.flat.js";
import "<CWD>/packages/core-js/modules/es.array.flat-map.js";
import "<CWD>/packages/core-js/modules/es.array.from.js";
import "<CWD>/packages/core-js/modules/es.array.includes.js";
import "<CWD>/packages/core-js/modules/es.array.join.js";
import "<CWD>/packages/core-js/modules/es.array.keys.js";
import "<CWD>/packages/core-js/modules/es.array.map.js";
import "<CWD>/packages/core-js/modules/es.array.of.js";
import "<CWD>/packages/core-js/modules/es.array.push.js";
import "<CWD>/packages/core-js/modules/es.array.slice.js";
import "<CWD>/packages/core-js/modules/es.array.sort.js";
import "<CWD>/packages/core-js/modules/es.array.species.js";
import "<CWD>/packages/core-js/modules/es.array.splice.js";
import "<CWD>/packages/core-js/modules/es.array.to-reversed.js";
import "<CWD>/packages/core-js/modules/es.array.to-sorted.js";
import "<CWD>/packages/core-js/modules/es.array.to-spliced.js";
import "<CWD>/packages/core-js/modules/es.array.unscopables.flat.js";
import "<CWD>/packages/core-js/modules/es.array.unscopables.flat-map.js";
import "<CWD>/packages/core-js/modules/es.array.values.js";
import "<CWD>/packages/core-js/modules/es.array.with.js";
import "<CWD>/packages/core-js/modules/es.function.name.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
// the dead-tail lift drops a sequence tail whose value nothing reads, and usage-global observes it
// only through the import set: each row's own family is its evidence, and the rest sibling keeps the
// whole init of the global it names. the lift and the residual read are rewrites - the pure sibling
// is where they are visible
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
  of: of2,
  ...rest
} = (0, Array);