import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `f` const-aliases the factory f0 BEFORE f0 is reassigned, so `f` permanently holds the declared
// `() => Object` - the later `f0 = () => Map` write is dead for `f`. the alias hop anchors its
// reassignment-dominance at the alias-read site, so the still-live declared init resolves (`f()` is
// Object) and only es.object.group-by injects, never es.map.group-by from the post-capture write
let f0 = () => Object;
const f = f0;
f0 = () => Map;
f().groupBy(items, cb);