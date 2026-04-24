// `const { Promise: MyP = Fallback } = globalThis` - alias Promise via destructure with
// a default value. the default is only reached when globalThis.Promise is missing; in the
// usual case MyP points at the real Promise. `super.try(...)` in the class still routes
// through the Promise polyfill because MyP traces back to the global Promise key
const { Promise: MyP = class {} } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
