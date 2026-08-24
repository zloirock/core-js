// three shapes the differential caught while the fixture gate stayed green - each one a
// claim the engine used to DROP or fold wrong:
// an optional dispatch over an SE-bearing sequence receiver, a nested instance leaf in a bodyless
// slot, and a `delete` whose target must stay a member read
const arr = [3, [1, 2]];
// a receiver the guard cannot spell twice memoizes INTO the test; the receiver's own prefix runs
// there, once, and only the KEY's effects stay in the alternate
export const a1 = (eff(), arr)?.flat();
export const a2 = (eff(), arr)?.at(1);
export const a3 = (eff(), arr)?.[(eff2(), 'flat')]();
export const a4 = (eff(), arr)?.flat()?.at(0);
// negative: a reusable receiver keeps its bare test, and a PURE prefix is not an effect
export const a5 = arr?.[(eff2(), 'flat')]();
export const a6 = (0, arr)?.flat();
// a nested instance leaf in a BODYLESS slot reads off the resolved hop, not off the init
export const b1 = (() => { if (cond) var { y: { flat: m } } = { y: arr }; return typeof m; })();
export const b2 = (() => { let i = 0; do var { y: { flat: m } } = { y: arr }; while (i++ < 0); return typeof m; })();
// ... while a STATIC leaf under the same hop never needed that receiver - its own pure is the value
export const b3 = (() => { if (cond) var { Array: { of: o } } = globalThis; return typeof o; })();
// a `delete` consumer needs the SLOT: the member survives with its key swapped, and the
// iterator-method fold - which would delete nothing and call the helper besides - stands down
export const c1 = (() => { delete globalThis[Symbol.iterator]; return 1; })();
export const c2 = (() => { delete (arr[Symbol.iterator]); return 1; })();
// negative: the same read OUTSIDE a delete still folds
export const c3 = globalThis[Symbol.iterator];
export const r = [a1, a2, a3, a4, a5, a6, b1, b2, b3, c1, c2, typeof c3];
