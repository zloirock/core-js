import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `const { Promise: MyP = Fallback } = globalThis` - alias Promise via destructure with
// a default value. the default is only reached when globalThis.Promise is missing; in the
// usual case MyP points at the real Promise. `super.try(...)` in the class still routes
// through the Promise polyfill because MyP traces back to the global Promise key
const MyP = _Promise === void 0 ? class {} : _Promise;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}