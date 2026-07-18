// global flavor of the lagged-alias recovery shapes: a redecl-with-init narrows the union
// to the redecl value's variant while the alias keeps its own candidates in the union
// (over-inject-safe), and a for-of head write keeps the member on the widened union
var M;
({ Map: M } = globalThis);
var M = [1, 2];
export const r1 = M.at(0);
let F;
({ Map: F } = globalThis);
for (F of [globalThis.x]) {}
export const r2 = F.flat();
// a deeper nested-function `var` is not a shadow at the writing function's level: the
// write keeps the union widened and every candidate module injected
let D;
({ Map: D } = globalThis);
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
({ Map: E } = globalThis);
E = [9];
export const r4 = E.toSpliced(0, 1);
