import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// the superclass namespace is bound to a const whose init is a zero-arg IIFE
// (`const NS = (() => ({ Base: Promise }))()`): the alias-init lookup peels the wrapper to the
// object literal, `NS.Base` resolves to Promise, so `super.allSettled` rewrites to the pure
// static - the const-alias path must peel the IIFE just like the inline extends clause does
const NS = (() => ({
  Base: _Promise
}))();
class C extends NS.Base {
  static run(x) {
    return _Promise$allSettled.call(this, x);
  }
}
C.run([]);