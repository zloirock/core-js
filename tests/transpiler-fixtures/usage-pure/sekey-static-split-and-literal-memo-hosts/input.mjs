// a STATIC (or ctor) claim under an effectful key beside SIBLING declarators takes the plain static's
// canon: one statement per declarator, the extraction in its own declarator's group ahead of the
// sentinel residual and BEHIND the receiver's sequence prefix - which is where the source ran it
// (an extraction ahead of the prefix would bind before the prefix could observe the binding).
// the same on an exported host (the prefix a plain statement ahead of the export), in a loop head
// (declarators, the prefix riding the value), and in a bodyless slot (the join, or a block around
// the lifted prefix). a static keeps its default guard there like the flat twin does
let k = 0;
function pre() {}
function eff() {}
export const first = 1, { [(k++, 'from')]: f, m } = Array;
export const lead = pre(), { [(k++, 'of')]: ko, alsoMore } = (eff(), Array);
var lead2 = pre(), { [(k++, 'of')]: ko2 = 1, m2 } = Array;
var lead3 = pre(), { [(k++, 'Map')]: P, m3 } = (eff(), globalThis);
var lead4 = pre(), { [(k++, 'of')]: ko4, ...r4 } = Array;
var lead5 = pre(), { [(k++, 'of')]: ko5, [(k++, 'from')]: fr5, m5 } = Array;
for (var lead6 = pre(), { [(k++, 'of')]: ko6, m6 } = (eff(), Array); false;) break;
if (k) var lead7 = pre(), { [(k++, 'of')]: ko7, m7 } = (eff(), Array);
while (k < 0) var lead8 = pre(), { [(k++, 'of')]: ko8, m8 } = Array;

// a CONSTANT-literal receiver under an effectful key memoizes beside sibling declarators too, the
// memo a preceding declarator at the source slot (or the `const` statement ahead where the residual
// holds the sentinel alone and a sibling was written ahead of it); a bodyless slot joins it, a loop
// head takes it as a declarator, an export keeps the memo off the module surface
var t1 = 0, { [(k++, 'at')]: a1 } = [1];
var { [(k++, 'at')]: a2 } = [1], t2 = 0;
var t3 = 0, { [(k++, 'at')]: a3, other3 } = [1];
for (var t4 = 0, { [(k++, 'at')]: a4 } = [1]; false;) break;
if (k) var t5 = 0, { [(k++, 'at')]: a5 } = [1];
export const t6 = 0, { [(k++, 'at')]: a6 } = [1];

// an UNCLAIMED effectful key beside a claim still segments the residual at the claim: native runs
// key, read, key, read, and the props past the claim are read after its dispatch
var { [(k++, 'of')]: o7, [(k++, 'at')]: a7, m7b } = [1];
var { [(k++, 'at')]: a8, m8b, [(k++, 'of')]: o8 } = [1];

// a bodyless slot beside sibling declarators: the flatten leaf and the static bind AHEAD of the
// residual, the instance claim behind the sentinel whose key runs first
do var { Array: { from: f9 }, keep9 } = globalThis, tail9 = 1; while (k < 0);
if (k) var lead10 = pre(), { [(k++, 'at')]: a10, m10 } = [1, 2];

// several claimed array hosts of one declaration stand in separate statements once an object hop
// beside them split the declaration; each keeps its extraction as the declarator after itself
const { w: { Map: M11 }, z11 } = { w: globalThis, z11: 1 }, [{ Set: S11 }, y11] = [globalThis, 2], [{ WeakMap: W11 }, q11] = [globalThis, 3];

export default [f, m, ko, alsoMore, lead, ko2, m2, P, m3, ko4, r4, ko5, fr5, m5, ko6, m6, ko7, m7, ko8, m8, a1, a2, a3, other3, a4, a5, a6, t1, t2, t3, t4, t5, t6, o7, a7, m7b, a8, m8b, o8, f9, keep9, tail9, a10, m10, M11, z11, S11, y11, W11, q11, lead2, lead3, lead4, lead5, lead6, lead7, lead8, lead10, k];
