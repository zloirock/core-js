// a nested-block `var` holding a computed static key. the computed-key alias-follow threads the use
// path into the binding lookup so the synthetic var-hoist binding surfaces and `Array[K]` resolves
// to the static, injecting its polyfill
function f(c) {
  if (c) {
    var K = 'fromAsync';
  }
  return Array[K]([1]);
}
f(true);
