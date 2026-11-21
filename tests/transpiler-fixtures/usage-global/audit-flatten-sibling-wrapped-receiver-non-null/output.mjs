import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.array.from.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.set.constructor.js";
import "<CWD>/packages/core-js/modules/es.set.species.js";
import "<CWD>/packages/core-js/modules/es.set.difference.js";
import "<CWD>/packages/core-js/modules/es.set.intersection.js";
import "<CWD>/packages/core-js/modules/es.set.is-disjoint-from.js";
import "<CWD>/packages/core-js/modules/es.set.is-subset-of.js";
import "<CWD>/packages/core-js/modules/es.set.is-superset-of.js";
import "<CWD>/packages/core-js/modules/es.set.symmetric-difference.js";
import "<CWD>/packages/core-js/modules/es.set.union.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/web.dom-collections.iterator.js";
const {
    Array: {
      from
    }
  } = globalThis,
  nonNull = globalThis!['Set'];
export { from, nonNull };