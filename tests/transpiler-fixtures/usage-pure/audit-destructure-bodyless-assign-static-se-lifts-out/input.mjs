// bodyless `if` body holds a destructure-assignment with an SE-prefixed static receiver.
// `sideEffect()` must run only when `cond` is truthy, so the unbraced slot must be wrapped
// in a block carrying the SE then the polyfilled assignment. without the wrap the SE leaks
// to the enclosing module scope and runs unconditionally.
let from;
if (cond) ({ from } = (sideEffect(), Array));
