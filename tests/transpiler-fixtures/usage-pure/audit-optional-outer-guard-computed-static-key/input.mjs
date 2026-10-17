// a computed static key `[(se, 'name')]` folding to a pure static, reached through a trailing instance
// dispatch that memoizes the root. whatever the root's own verdict, the static emits BARE into the body
// that owns it, and the computed-KEY effect rides ahead of it (`(c++, _Array$from)`). three root shapes,
// two verdicts:
//   - an ALIAS-assign root (`w = g`, a defined realm value) - erase, the assign folds with the key effect
//   - a PROXY-NAV-assign root (`v = globalThis.window`, an unbacked hop) - guard; without the fold the
//     static stayed a native read off the memo, a missed polyfill on the floor
//   - a SEQUENCE root over the same probe - guard, and its ctor-static leaf folds its key SE too
// distinct static + instance method per line
let w;
let v;
let u;
const g = globalThis;
let c = 0;
let d = 0;
let e = 0;
let f = 0;
export const aliasComputed = (w = g)?.Array[(c++, 'from')]([1]).at(0);
export const proxyNavComputed = (v = globalThis.window)?.Array[(d++, 'of')](5).includes(1);
export const seqCtorStaticComputed = ((e++, u = globalThis.window))?.Number[(f++, 'MAX_SAFE_INTEGER')].toFixed(2);
