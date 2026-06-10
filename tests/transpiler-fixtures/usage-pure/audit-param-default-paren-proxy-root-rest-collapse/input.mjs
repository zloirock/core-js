// a parenthesized proxy-global root (`(globalThis)`) in a DECLARED function's param-default
// rest shape: the retained default keeps its paren-aware value-identical collapse; the
// hop-deletion span must start at the paren-inclusive root, else it overlaps the root rewrite
// and the transform-queue rejects the composition.
// caller-soundness: lossy emissions are allowed here because the function is non-exported and
// every local call leaves the default in place (the resolver's call-site scan proves nothing
// exists to lose); exported / escaping / overridden functions stay verbatim instead.
function f({ from, ...rest } = (globalThis).self.Array) { return from([1]); }
f();
