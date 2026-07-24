import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a const alias of a conditionally-reassigned zero-arg factory (`const f = f0`) reaches BOTH branches
// f0 can hold: the declared `() => Object` (c-false) and the reassigned `() => Map` (c-true). `.groupBy`
// exists on both, so `f().groupBy` injects es.object.group-by AND es.map.group-by - the alias hop must
// follow the const-alias into f0 and preserve its declared value beside its reassignments
let f0 = () => Object;
if (c) f0 = () => Map;
const f = f0;
f().groupBy(items, cb);