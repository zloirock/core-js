import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the factory's declared init is DEAD - `f0` is unconditionally reassigned before the alias read, so
// only `() => Map` reaches `f()`. the alias hop anchors its dominance check at the alias-read site, so
// the dead `() => Object` is excluded: only es.map.group-by injects, never es.object.group-by
let f0 = () => Object;
f0 = () => Map;
const f = f0;
f().groupBy(items, cb);