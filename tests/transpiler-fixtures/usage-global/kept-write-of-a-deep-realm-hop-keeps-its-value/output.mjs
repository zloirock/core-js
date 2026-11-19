import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
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
// A kept write of a realm hop past another realm hop hides nothing from usage detection: the static,
// the constructor and the realm global each navigation reaches over the stored value pull their
// modules, whatever spells the root.
let v;
const g = globalThis;
const l = [1, 2];
export const viaFrom = (v = globalThis.self.window)?.window?.self.Array.from(l).length;
export const viaOf = (v = globalThis.self.window)?.window?.window?.self.Array.of(1);
export const viaCtor = new ((v = globalThis.self.window)?.window?.self.Set)(l);
export const viaAlias = (v = g.self.window)?.window?.self.Math.trunc(2.5);
export const viaSelf = (v = self.self.window)?.window?.self.Object.entries(l);
export const viaTypeof = typeof (v = globalThis.self.window)?.window?.self.Map;