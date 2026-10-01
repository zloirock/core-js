// a LAGGED alias binding (babel drops it from its scope registry after the destructure-
// assignment rewrite) crossed with sibling redeclarations and a for-of head write. the
// rebuilt binding mirrors a native one: a redecl-with-init is an ordinary violation the
// redecl flow resolves to its value's variant, a bare redecl carries no value and keeps
// the alias narrow, and a for-of head write widens the member to the generic helper
var M;
({ Map: M } = globalThis);
var M = [1, 2];
export const r1 = M.at(0);
export const r1b = M.toSorted();
export const r1c = M?.toReversed();
var B;
({ Map: B } = globalThis);
var B;
export const r2 = B.groupBy([1], x => x);
let F;
({ Map: F } = globalThis);
for (F of [globalThis.x]) {}
export const r3 = F.flat();
// a `var` of the same name in a DEEPER nested function is not a shadow at the writing
// function's level: the write there still counts and widens the member to generic
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
export const r4 = [D.includes('d'), outer()];
// an EXPORTED lagged alias resolves through the export wrapper the same as a plain one
export let E;
({ Map: E } = globalThis);
E = [9];
export const r5 = E.toSpliced(0, 1);
// an update write makes the value unknown - the member widens to the generic helper
var U;
({ Map: U } = globalThis);
U++;
export const r6 = U.flatMap(x => x);
// a case-consequent lexical is outside the recovery's block climb - conservative generic
switch (globalThis.k) {
  case 1:
    let S;
    ({ Map: S } = globalThis);
    S = [4];
    globalThis.r7 = S.with(0, 'w');
}
// the other lexical hosts the recovery climbs: a plain block and a class static block
{
  let K;
  ({ Map: K } = globalThis);
  K = [5];
  globalThis.r8 = K.findLast(Boolean);
}
class C {
  static {
    let T;
    ({ Map: T } = globalThis);
    T = [6];
    C.r9 = T.findLastIndex(Boolean);
  }
}
export { C };
