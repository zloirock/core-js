// parameter destructure default combining a COMPUTED proxy hop (`globalThis['self']`) with a
// rest sibling on a DECLARED function: the retained default keeps its value-identical collapse
// to `_globalThis.Array`. lossy emissions are sound here because the function is non-exported
// and every local call leaves the default in place; exported / escaping ones stay verbatim.
function f({ from, ...rest } = globalThis['self'].Array) { return [from, rest]; }
f();
