// a SLOT-mutated ctor (user shim installed on the proxy) keeps the anchored symbol
// extraction on the RAW member read - the shim's own iterator method must win over the
// pure constructor binding
globalThis.Map = Shim;
const { Map: { [Symbol.iterator]: x } } = globalThis;
x;
