import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// usage-global twin of the chain-assignment-rooted hop collapse: the detection side must see the
// SAME roots the emit side collapses, so every line still contributes its leaf usage to the
// import set. distinct constructors and methods per line attribute a missed root to its form.
let a, b, c, d;
const g = globalThis;
export const viaAssign = (a = globalThis).self.Array.from([1]);
export const pureLeaf = (b = globalThis).self.Map;
export const noHop = (c = globalThis).Promise;
export const aliasInAssign = (d = g).self.Reflect.ownKeys({});
export const nestedAssign = [1, 2].at(-1);