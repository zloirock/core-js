// a SLOT-mutated ctor pair (the global's own key is reassigned) keeps the hop residual
// on the RAW member read - the user-installed replacement must win there; the key patch
// routed to the ponyfill stays invisible through it. extractions stay leaf-gated
const orig = globalThis.Map;
globalThis.Map = function FakeMap() {};
Map.groupBy = function patched() {};
const { Map: { groupBy: rawRead } } = globalThis;
console.log(orig, rawRead);
