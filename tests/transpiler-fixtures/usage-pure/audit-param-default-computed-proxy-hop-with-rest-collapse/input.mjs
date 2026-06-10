// parameter destructure default combining a COMPUTED proxy hop (`globalThis['self']`) with a
// rest sibling on a DECLARED function: the retained default keeps its value-identical collapse
// to `_globalThis.Array`.
// caller-soundness: lossy emissions are allowed here because the function is non-exported and
// every local call leaves the default in place (the resolver's call-site scan proves nothing
// exists to lose); exported / escaping / overridden functions stay verbatim instead.
function f({ from, ...rest } = globalThis['self'].Array) { return [from, rest]; }
f();
