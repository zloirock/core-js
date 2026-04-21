// two instance polyfills sharing the same optional root — inner reuses outer's guardRef
// via `outerHint.rootRaw -> guardRef` candidate in substituteInner
fn()?.at(0)?.flat();
