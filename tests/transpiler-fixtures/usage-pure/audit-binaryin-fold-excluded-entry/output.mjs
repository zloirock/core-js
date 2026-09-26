import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// the `in` fold is gated on the entry being NEEDED: an excluded key must stay a native `in`
// (folding to `true` would lie - the excluded polyfill never defines the key at runtime).
// three fold shapes crossed with `exclude`: a static key, a global name in globalThis, a
// well-known-symbol LHS; the non-excluded control below still folds
export const excludedStatic = 'from' in Array;
export const excludedGlobal = 'Promise' in _globalThis;
export const excludedSymbolIn = _Symbol.asyncIterator in {};
export const foldedControl = true;