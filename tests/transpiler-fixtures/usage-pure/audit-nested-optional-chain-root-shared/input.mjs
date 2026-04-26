// two instance polyfills share the same optional-chain root: the inner rewrite reuses
// the outer ref binding so the source `fn()` is evaluated only once
fn()?.at(0)?.flat();
