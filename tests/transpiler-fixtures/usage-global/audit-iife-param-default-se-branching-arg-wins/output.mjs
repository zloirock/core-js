import "core-js/modules/es.array.iterator";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// an IIFE param-default destructure receiver arrives as an SE-prefixed BRANCHING call-arg. the arg
// supersedes the runtime-dead default, so usage-global must enumerate the ARG's reachable branches
// and inject each static - not the default's. the leading side effect runs but does not change which
// receiver the branches classify; peeling the sequence tail before the usable-arg gate is what lets
// the enumeration see the branch (the provider path passed the raw arg). distinct method per line
export const a = (({
  groupBy
} = Object) => groupBy(items, fn))((eff(), c ? Map : WeakMap));
export const b = (({
  from
} = Array) => from(src))((log(), d ? Date : Iterator));