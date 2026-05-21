import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
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
// JSX elements used inside a decorator position (`@(<Map />)` and `@(<Set.X />)`)
// must still trigger global polyfill detection on the JSX tag root. The first
// decorator references the global `Map` directly, the second references `Set` as
// the root of a member-expression JSX tag. Each class should emit its respective
// global polyfill (`es.map` / `es.set`), proving JSX inside decorators is scanned
// identically to JSX at expression position.
@(<Map />)
class WithMap {}
@(<Set.X />)
class WithSetRoot {}