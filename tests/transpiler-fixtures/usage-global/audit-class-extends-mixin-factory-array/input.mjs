// even when `Array` is the argument of a mixin call in the `extends` clause, it must be
// recognised as a polyfillable global.
function Mix(Base) {
  return class extends Base {
    extra() { return 42; }
  };
}
class X extends Mix(Array) {
  flatten(arr) { return arr.flat(); }
}
new X().flatten([[1], [2]]);
