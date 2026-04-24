// combo: subclass `extends Promise` pulls in the Promise constructor polyfill + static method
// destructures `super.constructor` (resolves to the polyfilled base) + optional call on the
// destructured binding. only the extends-target is polyfillable here; the `try` key is not
// registered as a Promise static so its destructure stays raw
class D extends Promise {
  static run() {
    const { try: t } = super.constructor;
    t?.(() => 1);
  }
}
