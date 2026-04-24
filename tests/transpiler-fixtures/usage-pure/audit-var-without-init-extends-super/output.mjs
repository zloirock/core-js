import _Promise from "@core-js/pure/actual/promise/constructor";
// `var X;` declared without init (starts as undefined), later conditionally assigned. X is
// reassignable and its effective value at the class-evaluation point depends on runtime
// flow. plugin can't commit to a specific super class, so `super.try(...)` stays raw. the
// code is semantically broken anyway (extending undefined throws at class-eval), and
// plugin correctly doesn't paper over it with a speculative polyfill
var X;
if (Math.random() > 0.5) X = _Promise;
class C extends X {
  static run() {
    return super.try(() => 1);
  }
}