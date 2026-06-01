// a parenthesized proxy-global root (`(globalThis)`) in a param-default rest-collapse: the
// hop-deletion span must start at the paren-inclusive root, else it overlaps the root rewrite
// and the transform-queue rejects the composition
function f({ from, ...rest } = (globalThis).self.Array) { return from([1]); }
f();
