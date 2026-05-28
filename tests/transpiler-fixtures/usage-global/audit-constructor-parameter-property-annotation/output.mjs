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
// `TSParameterProperty` (constructor parameter property `public` / `private` / `readonly`)
// wraps the inner Identifier - the annotation walker must peel the wrapper to reach the
// declared `Map<...>` / `Set<...>` types, otherwise no polyfill is injected. no runtime
// `new Map()` / `new Set()` here on purpose, so the only way polyfills get pulled in is
// through the annotation walker descending into TSParameterProperty.parameter
class C {
  constructor(public m: Map<string, number>, private readonly s: Set<Date>) {}
}
[C];