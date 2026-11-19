// a closure use visited BEFORE the aliasing destructure-write resolves through the trusted-
// write channel; a trailing valueless redeclaration (`var M;`) is a phantom record that must
// not mask the write - the static still injects
var M;
function g() { return M.groupBy([1], x => x); }
({ Map: M } = globalThis);
var M;
export { g };

// control without the phantom keeps the same injection set
var N;
function h() { return N.from([1].values()); }
({ Iterator: N } = globalThis);
export { h };
