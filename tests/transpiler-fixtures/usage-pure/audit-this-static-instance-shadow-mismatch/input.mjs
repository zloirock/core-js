// Instance method `try` is NOT a shadow for `this.try` in a static context - `this` in
// static is the class constructor, so `this.try` reads the *static* surface, which isn't
// declared on C. It falls through to the super class's static (Promise.try) and should
// polyfill. `isShadowedByClassOwnMember` must distinguish instance vs static members.
class C extends Promise {
  try(x) { return x; }
  static run() {
    return this.try(() => 1);
  }
}
