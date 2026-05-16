// Bodyless `if` body with destructure-assignment + SE-prefixed static-value receiver.
// The SE expression `sideEffect()` must execute only when `cond` is truthy. emission
// wraps the unbraced slot in a block carrying the SE-init expression followed by the
// polyfilled assignment, so the SE evaluates conditionally on the host. without the
// wrap, the SE would leak to the enclosing array-bodied parent (module scope here)
// and execute unconditionally.
let from;
if (cond) ({ from } = (sideEffect(), Array));
