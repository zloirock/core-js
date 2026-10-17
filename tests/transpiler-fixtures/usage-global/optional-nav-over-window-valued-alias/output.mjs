import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// Optional links up a navigation off an alias holding the environment probe's value hide nothing
// from usage detection: each realm hop and the static or constructor the chain reads pull their modules,
// for a read, a `typeof`, a `delete` and a sealed read alike, however the alias was written.
const win = globalThis.window;
let late;
late = self.window;
const deep = globalThis.self.window;
export const read = win?.window?.self.Array.from;
export const kind = typeof deep?.window?.window?.self.Math.trunc;
export const removed = delete win?.window?.self?.Reflect.slot;
export const sealed = (late?.window?.self).Object.entries;
export const built = new (deep?.window?.self.Set)();