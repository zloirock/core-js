// `yield* iter` delegating yield: the iteration protocol must be polyfilled because
// `yield*` walks the inner iterator at runtime.
function* f() {
  yield* iter;
}