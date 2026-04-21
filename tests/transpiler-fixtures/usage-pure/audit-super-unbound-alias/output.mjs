import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `resolveSuperClassName` walks `P → Promise` via Identifier init, then `Promise` has no
// binding in scope → returns `Promise` (final terminator). `super.try` resolves against
// `statics.Promise.try` and is rewritten to the plugin-injected import
const P = _Promise;
class C extends P {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}