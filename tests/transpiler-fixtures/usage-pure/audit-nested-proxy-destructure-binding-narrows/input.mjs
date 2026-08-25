// nested proxy-global destructure `const {window: {Array}} = globalThis` must walk
// through proxy-global keys (`window`, `self`, ...) so the leaf `Array` binding still
// registers as the global; otherwise downstream `Array.from(...)` loses its narrow
const { window: { Array } } = globalThis;
const arr = Array.from([1, 2, 3]);
const head = arr.at(0);
export { head };

// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const { box: { Array: BoxArray } } = globalThis;
const boxed = BoxArray.from([4, 5]);
// NEGATIVE: a MUTATED proxy slot is the user's own replacement, so the leaf below it stays native
globalThis.self = { Array: BoxArray };
const { self: { Array: SelfArray } } = globalThis;
const swapped = SelfArray.from([6]);
export { boxed, swapped };

// NEGATIVE: the mutated slot read as the ROOT BINDING - the bare name holds the user's
// replacement, so no leaf below it narrows, extracts or mirrors
const { Array: { from: mutFrom } } = self;
const { inner: { [Symbol.iterator]: mutIter } } = self;
function viaParam({ Array: { from: paramFrom } } = self) {
  return paramFrom;
}
export { mutFrom, mutIter, viaParam };

// ... and through an ALIAS of that mutated name: the binding holds the user's replacement too,
// so the leaf below it stays native exactly like the direct read
const aliasOfMutated = self;
const { Array: { from: viaAlias } } = aliasOfMutated;
export { viaAlias };
