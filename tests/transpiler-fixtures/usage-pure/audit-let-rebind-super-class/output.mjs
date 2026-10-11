import _Promise from "@core-js/pure/actual/promise";
// `class C extends X` where a write MAY replace the `let` X before the class: the heritage is Promise or
// the caller's class, so `super.try()` stays raw, and the init imports the namespace entry - where the
// write does not run, the raw read finds `try` on it, which `*/constructor` lacks
export function subclass(Custom) {
  let X = _Promise;
  if (Custom) X = Custom;
  class C extends X {
    static run() {
      return super.try(() => 1);
    }
  }
  return C.run();
}