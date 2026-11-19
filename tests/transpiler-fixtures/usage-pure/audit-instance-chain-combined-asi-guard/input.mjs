// instance-chain-combined emit wraps the conditional rewrite in parens when the parent
// demands grouping (binary `+ 1` here). at a statement-leading slot the leading `(` would
// fuse with the preceding statement via ASI (`f()\n(_polyfill(...))` -> `f()(...)`,
// TypeError at runtime). a leading `;` is inserted so ASI sees a separate statement boundary
f()
arr.flat?.().map(y => y) + 1;
