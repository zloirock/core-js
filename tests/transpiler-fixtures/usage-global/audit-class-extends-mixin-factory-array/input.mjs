// mixin pattern `class X extends Mix(Array)`. The factory returns a class that extends
// Array; the polyfill detector must recognize Array as a possibly-polyfilled global usage
// even when wrapped in a CallExpression on the heritage clause. Polyfill for
// Array.prototype.flat fires on the inner usage downstream
function Mix(Base) {
  return class extends Base {
    extra() { return 42; }
  };
}
class X extends Mix(Array) {
  flatten(arr) { return arr.flat(); }
}
new X().flatten([[1], [2]]);
