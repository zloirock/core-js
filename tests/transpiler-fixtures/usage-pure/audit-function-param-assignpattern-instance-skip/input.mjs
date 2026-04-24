// instance-method destructure in a function param default (`{ includes } = X`) is skipped:
// a param default only fires when `X[key]` is undefined, and the instance-style polyfill
// would need a stable receiver ref to call into, which the parameter form can't capture
// safely. the user gets the raw destructure, not a polyfilled rewrite
function fn({ includes } = X) {
  return includes;
}
fn;
