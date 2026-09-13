import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$try from "@core-js/pure/actual/promise/try";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  Promise: MyP,
  ...rest
} = _globalThis;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}