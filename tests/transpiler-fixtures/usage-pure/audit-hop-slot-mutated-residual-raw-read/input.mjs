// a SLOT-mutated ctor pair (the global's own key is reassigned) keeps the hop residual
// on the RAW member read - the user-installed replacement wins on EVERY surface: bare
// reads re-route through the global-object binding, so the key patch lands on the shim
// and the raw destructure read sees the same object
const orig = globalThis.Map;
globalThis.Map = function FakeMap() {};
Map.groupBy = function patched() {};
const { Map: { groupBy: rawRead } } = globalThis;
console.log(orig, rawRead);
