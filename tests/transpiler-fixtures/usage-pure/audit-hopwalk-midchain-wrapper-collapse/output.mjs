import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
// a MID-CHAIN wrapper between the proxy hop and the consuming member - a paren or a TS cast
// around the hop segment (`((a = globalThis).self).Array`) - must not break the collapse walks:
// the receiver renderer rebuilds the surviving hops instead of a flat tail slice (which would
// carry the wrapper's dangling close token), and the collapse plan compares the walked prefix
// against the PEELED object (the raw `.object` is the wrapper node). the cast variant lives in
// the TS twin fixture; distinct methods per line attribute a regressed form.
let a, b;
export const flat = _flatMaybeArray((a = _globalThis, _globalThis).Array.prototype);
export const includes = _includes((b = _globalThis, _globalThis).Array.prototype);