// the symbol-`in` rewrite REPLACES the LHS with the symbol import, so EVERY side effect around the symbol
// must be harvested and re-prepended in source order - including a NESTED sequence tail that a prefix-only
// walk dropped. each line nests a second sequence inside the receiver tail; both effects must survive, on
// the is-iterable path (Symbol.iterator -> a call) AND the symbol/X path (asyncIterator -> binding swap)
// AND a computed key. distinct symbols + effect names per line so each harvested effect is attributable.
const a = (g(), (h(), Symbol)).iterator in x;
const b = (p(), (q(), Symbol)).asyncIterator in y;
const c = Symbol[(u(), (v(), 'hasInstance'))] in z;
