import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `class C extends Promise` declares `try` as an INSTANCE method - `this.try` in a static
// context reads the static surface (the ctor), not the instance prototype, so the instance
// declaration is not a shadow. plugin falls through to Promise.try on the super class's
// static surface and polyfills accordingly. shadow detection must match member placement
class C extends _Promise {
  try(x) {
    return x;
  }
  static run() {
    return _Promise$try(() => 1);
  }
}