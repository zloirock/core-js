import _Promise from "@core-js/pure/actual/promise/constructor";
// combo: subclass `extends Promise` pulls in the Promise constructor polyfill + static method
// destructures `super.constructor` (resolves to the polyfilled base) + optional call on the
// destructured binding. only the extends-target is polyfilled here: the destructure producer is
// an ObjectPattern, not a member expression, so the inherited-static remap that rewrites direct
// `super.try` reads never fires and the `try` binding stays raw - a known under-injection gap
class D extends _Promise {
  static run() {
    const {
      try: t
    } = super.constructor;
    t?.(() => 1);
  }
}