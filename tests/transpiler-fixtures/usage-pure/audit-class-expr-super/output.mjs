import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// class expression extending a polyfilled built-in with `super.method(...)`: the
// static-method dispatch routes through the pure-mode polyfilled super.
const C = class extends _Promise {
  static m() {
    return _Promise$allSettled.call(this, []);
  }
};