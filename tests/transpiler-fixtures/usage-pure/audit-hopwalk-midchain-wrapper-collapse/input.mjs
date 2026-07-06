// a MID-CHAIN wrapper between the proxy hop and the consuming member - a paren or a TS cast
// around the hop segment (`((a = globalThis).self).Array`) - must not break the collapse walks:
// the receiver renderer rebuilds the surviving hops instead of a flat tail slice (which would
// carry the wrapper's dangling close token), and the collapse plan compares the walked prefix
// against the PEELED object (the raw `.object` is the wrapper node). the cast variant lives in
// the TS twin fixture; distinct methods per line attribute a regressed form.
let a, b;
export const { flat } = ((a = globalThis).self).Array.prototype;
export const { includes } = (b = globalThis)['self'].Array.prototype;
