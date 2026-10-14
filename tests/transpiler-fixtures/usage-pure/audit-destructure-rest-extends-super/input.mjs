// A constructor destructured off the realm beside an object rest binds its ponyfill, and a class
// extending it calls a static through `super` on that static's own entry with the class as `this`:
// the constructor's narrow entry carries no statics of its own.
const { Promise: MyP, ...rest } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
