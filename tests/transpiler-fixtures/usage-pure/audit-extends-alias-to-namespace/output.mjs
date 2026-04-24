import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// two-step chain: `const A = NS.P` where `NS.P` is itself an alias to Promise via the
// user-namespace. plugin composes the chain A -> NS.P -> Promise and polyfills super.try
// accordingly. works uniformly regardless of how the alias was introduced (direct Identifier,
// proxy-global member chain, or object-literal namespace)
const NS = {
  P: _Promise
};
const A = NS.P;
class C extends A {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}