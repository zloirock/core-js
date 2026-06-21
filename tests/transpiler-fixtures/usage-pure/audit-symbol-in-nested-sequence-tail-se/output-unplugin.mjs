import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$hasInstance from "@core-js/pure/actual/symbol/has-instance";
// the symbol-`in` rewrite REPLACES the LHS with the symbol import, so EVERY side effect around the symbol
// must be harvested and re-prepended in source order - including a NESTED sequence tail that a prefix-only
// walk dropped. each line nests a second sequence inside the receiver tail; both effects must survive, on
// the is-iterable path (Symbol.iterator -> a call) AND the symbol/X path (asyncIterator -> binding swap)
// AND a computed key. distinct symbols + effect names per line so each harvested effect is attributable.
const a = (g(), h(), _isIterable(x));
const b = (p(), q(), _Symbol$asyncIterator in y);
const c = (u(), v(), _Symbol$hasInstance) in z;