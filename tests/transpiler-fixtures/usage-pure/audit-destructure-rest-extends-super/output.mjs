import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// A constructor destructured off the realm beside an object rest binds its ponyfill, and a class
// extending it calls a static through `super` on that static's own entry with the class as `this`:
// the constructor's narrow entry carries no statics of its own.
const MyP = _Promise;
const {
  Promise: _unused,
  ...rest
} = _globalThis;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}