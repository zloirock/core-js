// a parenthesized proxy-global root (`(globalThis)`) in a DECLARED function's param-default
// rest shape: the retained default keeps its paren-aware value-identical collapse; the
// hop deletion must start at the paren-inclusive root, else it overlaps the root
// rewrite. lossy here is sound (function is non-exported).
function f({ from, ...rest } = (globalThis).self.Array) { return from([1]); }
f();
