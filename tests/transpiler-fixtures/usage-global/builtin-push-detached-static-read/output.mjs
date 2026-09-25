import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A constructor a builtin inserts through a detached invoker - `.call`, `.apply` - keeps the same
// conservative injection the direct spelling gets, so the later slot read finds its static.
// one constructor per spelling
const b = [];
b.push.call(b, Map);
const viaCall = typeof b[0].groupBy;
const c = [];
c.push.apply(c, [Promise]);
const viaApply = typeof c[0].try;
export { viaCall, viaApply };