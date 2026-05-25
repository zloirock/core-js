import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `Map ||= 1` in usage-global mode: side-effect polyfill imports populate the global before
// module body runs, so `||=` reads Map (truthy) and no-ops. plugin doesn't rewrite write-
// context globals -> no polyfill emission at this site, no warning (only pure mode warns
// because the rewrite substitutes a read-only import binding and write would TypeError)
Map ||= 1;