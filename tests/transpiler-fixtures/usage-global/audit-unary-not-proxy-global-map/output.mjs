import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `!globalThis.Map` - pure existence check against the proxy global. global-mode polyfill
// injection is triggered by the MemberExpression access regardless of the UnaryExpression
// wrapper, so `es.map.constructor` side-effect import fires before the check reads
// globalThis.Map (at which point the polyfill has already populated it)
if (!globalThis.Map) throw new Error("Map missing");