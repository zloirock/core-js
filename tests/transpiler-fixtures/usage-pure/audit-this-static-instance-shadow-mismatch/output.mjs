import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// Instance method `try` is NOT a shadow for `this.try` in a static context - `this` in
// static is the class constructor, so `this.try` reads the *static* surface, which isn't
// declared on C. It falls through to the super class's static (Promise.try) and should
// polyfill. `isShadowedByClassOwnMember` must distinguish instance vs static members.
class C extends _Promise {
  try(x) {
    return x;
  }
  static run() {
    return _Promise$try(() => 1);
  }
}