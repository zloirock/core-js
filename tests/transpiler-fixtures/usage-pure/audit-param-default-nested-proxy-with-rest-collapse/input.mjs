// parameter destructure default with a proxy hop (`globalThis.self.Array`) and a rest sibling
// on a DECLARED function: the retained default keeps its value-identical proxy collapse
// (`_globalThis.Array` - `.self` would read undefined off the pure proxy on old targets). lossy
// emissions are sound here because the function is non-exported; exported / escaping stay verbatim.
function f({ from, ...rest } = globalThis.self.Array) { return [from, rest]; }
f();
