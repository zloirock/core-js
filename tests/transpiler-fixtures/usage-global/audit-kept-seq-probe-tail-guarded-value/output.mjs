import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// the usage-global twin of the kept-sequence probe-tail forms: the source is not rewritten, so
// the lock is the import set alone - the probe hop pulls `web.self` and the realm entries, and
// the claims resolve through the kept spelling exactly like the bare twin. per-line distinct
// methods keep the injections separable.
let c = 0,
  d = 0;
export const staticCombined = (d++, c++, globalThis.window.self)?.Map.name;
export const instanceNav = (d++, c++, globalThis.window.self)?.Array.prototype.at;
export const navRoot = (d++, c++, globalThis.self)?.Array.prototype.includes;
export const probeFallback = (d++, c++, globalThis.window)?.Promise.noSuchStatic;