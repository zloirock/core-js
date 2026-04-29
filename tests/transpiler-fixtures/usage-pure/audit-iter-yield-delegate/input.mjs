// non-emission lock: `yield* iter` delegating yield stays raw in pure mode; iterator-
// instance dispatch driven by `yield*` requires an `Iterator.from` anchor and is
// intentionally not auto-emitted.
function * f() {
  yield * iter;
}
