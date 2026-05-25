import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// `globalThis.self.Map ||= X` - multi-hop proxy-global chain. inner identifier visits
// trigger Map / Promise polyfill emission (the chain IS a polyfillable read of the leaf
// before the assignment). usage-global stays silent (no warning); pure mode is where the
// LHS warning fires for the same chain via globalProxyMemberName
globalThis.self.Map ||= 1;
globalThis.window.Promise ??= 2;