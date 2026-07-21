// a single proxy hop under a DOUBLE `?.` over an undefinable root: the leaf swap used to
// claim the prefix always-defined and ate the ROOT guard - native short-circuits to
// undefined where the emit read a live value (or threw). the guard now survives, binds the
// deepest optional's root, and the hop folds onto the guarded read
globalThis.Set = class PatchedSet extends Set {};
let v;
export const mutatedSingle = (v = globalThis.window)?.self?.Set.name;
let n;
export const nonMutatedSingle = (n = globalThis.window)?.self?.WeakSet.name;
// the ALIAS spelling hides the undefinable navigation behind the binding - same guard
const w = globalThis.window;
let a;
export const aliasMutated = (a = w)?.self?.Set.name;
let b;
export const aliasNonMutated = (b = w)?.self?.WeakSet.name;
// REDUNDANT double parens around the root spell BARE in the guard memo on both emitters
// (a required single paren already strips; sequence parens always survive)
let dp;
export const doubleParenRoot = ((dp = globalThis.window))?.self?.Set.name;
// an always-defined root keeps the locked leaf-swap deopt (control)
let p;
export const resolvableRoot = (p = globalThis)?.self.Set.name;
// a static claim over the undefinable root keeps its ponyfill INSIDE the surviving guard
let c;
export const claimUnderGuard = (c = globalThis.window)?.Array?.of(1);
