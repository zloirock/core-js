import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// the well-known-symbol strand reaches the same receiver through its OWN collapse: it too must keep the
// assignment as the receiver rather than read the symbol off the pure root, which would silently discard
// the object the source named and answer for ours instead
let s;
export const iterOfKeptRoot = _getIteratorMethod(s = _globalThis.window);