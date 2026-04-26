// two polyfillable instance calls in one optional chain `x?.a().b()`: each call site
// is rewritten and the chain guard is shared correctly.
arr?.at(0)?.includes(1);
