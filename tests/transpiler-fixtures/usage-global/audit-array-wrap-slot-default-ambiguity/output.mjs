import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
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
// a slot default is default-or-runtime: the binding MIGHT be the default's global (it fires
// whenever the runtime pair is undefined), so usage-global keeps the maybe-union and injects
// the default's modules - inject-if-might is sound here, unlike the pure fold which must bail
let t = [{}, {}];

// defined foreign pair: the default still registers the maybe (over-inject safe)
let userObj = {};
const [p0, {
  Map: M
} = globalThis] = [{}, userObj];
export const viaForeignPair = M.groupBy([1, 2], v => v);

// spread-shifted pair: the default may fire - the array leg injects
const [s0, {
  Array: A
} = globalThis] = [...t];
export const viaSpreadPair = A.from([1, 2]);

// control: a provably-defined pair resolves and injects its constructor modules
let fallback = {};
const [{
  Set: C
} = fallback] = [globalThis];
export const viaSoundPair = new C(soundSeed);