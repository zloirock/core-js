import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// usage-global counterpart: the member expression stays verbatim, so this locks that DETECTION still resolves
// the polyfills THROUGH an optional proxy-global chain rooted in a PURE call and injects each side-effect
// import. the inner proxy-global of the kept null-guard call must rewrite (`globalThis -> _globalThis`) the
// same as pure, and the receiver-LESS collapse cases (ctor / called static method) drop the subsumed call.
// distinct method per line: instance method, `instance`-kind `.name` get, ctor on the proxy-global, static method.
const wrapInstance = (() => globalThis)()?.self.Array.prototype.at.call([1, [2]], 0);
const wrapGet = (() => globalThis)()?.self.Map.name;
const collapseCtor = (() => globalThis)()?.self.WeakSet;
const collapseStatic = (() => globalThis)()?.self.Object.fromEntries([]);
export { wrapInstance, wrapGet, collapseCtor, collapseStatic };