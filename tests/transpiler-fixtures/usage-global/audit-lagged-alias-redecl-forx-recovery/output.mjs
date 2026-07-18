import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// global flavor of the lagged-alias recovery shapes: a redecl-with-init narrows the union
// to the redecl value's variant while the alias keeps its own candidates in the union
// (over-inject-safe), and a for-of head write keeps the member on the widened union
var M;
({
  Map: M
} = globalThis);
var M = [1, 2];
export const r1 = M.at(0);
let F;
({
  Map: F
} = globalThis);
for (F of [globalThis.x]) {}
export const r2 = F.flat();
// a deeper nested-function `var` is not a shadow at the writing function's level: the
// write keeps the union widened and every candidate module injected
let D;
({
  Map: D
} = globalThis);
function outer() {
  function inner() {
    var D = 0;
    return D;
  }
  D = ['d'];
  return inner;
}
export const r3 = [D.includes('d'), outer()];
// an EXPORTED lagged alias: the redecl value's variant joins the alias candidates in the union
export let E;
({
  Map: E
} = globalThis);
E = [9];
export const r4 = E.toSpliced(0, 1);