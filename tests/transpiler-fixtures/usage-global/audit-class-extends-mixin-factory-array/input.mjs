// A local mixin receives Array as its base without exposing the constructor.
// The extends clause remains visited; only the instance read needs its polyfills.
function Mix(Base) {
  return class extends Base {
    extra() { return 42; }
  };
}
class X extends Mix(Array) {
  flatten(arr) { return arr.flat(); }
}
new X().flatten([[1], [2]]);
