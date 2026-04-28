import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// user pre-imports `es.set.constructor` (a partial / minimal subset). plugin still
// needs intersection + dependent helpers, but must not re-emit `es.set.constructor`.
// dedup keys on resolved module path; user's import sits in the polyfill batch
// where the plugin would otherwise have placed it

const s = new Set();
s.has(1);
s.intersection(other);