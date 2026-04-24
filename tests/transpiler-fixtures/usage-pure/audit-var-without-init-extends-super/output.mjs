import _Promise from "@core-js/pure/actual/promise/constructor";
// `var X;` without init (undefined), later assigned. var has constantViolations, so
// resolveSuperClassName returns null. class C extends X doesn't resolve.
// This is semantically broken at runtime (can't extend undefined), plugin correctly
// doesn't polyfill super.try which would mask the broken shape.
var X;
if (Math.random() > 0.5) X = _Promise;
class C extends X {
  static run() {
    return super.try(() => 1);
  }
}