import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `extends NS.Promise` with `const NS = { Promise }` - user-namespace wrapping the global
// via shorthand property. plugin follows NS.Promise to the namespace member, then the
// member value (Promise identifier) to the global, and routes `super.try(...)` through
// the Promise polyfill
const NS = {
  Promise: _Promise
};
class C extends NS.Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}