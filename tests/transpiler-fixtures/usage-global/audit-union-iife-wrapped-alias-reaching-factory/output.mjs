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
// the alias source is wrapped in a zero-arg IIFE (`const f = (() => f0)()`): the hop peels the wrapper
// to the underlying factory f0 and preserves BOTH its branches - the declared `() => Object` (c-false)
// and the reassigned `() => Map` (c-true) - so `f().groupBy` injects es.object.group-by AND es.map.group-by
let f0 = () => Object;
if (c) f0 = () => Map;
const f = (() => f0)();
f().groupBy(items, cb);