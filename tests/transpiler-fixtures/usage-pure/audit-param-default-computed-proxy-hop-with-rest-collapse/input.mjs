// parameter destructure default combining a COMPUTED proxy hop (`globalThis['self']`) with a
// ...rest sibling. the computed hop must be recognised and COLLAPSED to `_globalThis.Array`
function f({ from, ...rest } = globalThis['self'].Array) { return [from, rest]; }
f();
