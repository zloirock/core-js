import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// identifier alias whose init points at a user-namespace member: `const A = NS.P`.
// `resolveSuperClassName`'s non-Identifier init fallback delegates to the unified primitive,
// so the chain `A -> NS.P -> Promise` composes end-to-end. `super.try(...)` routes through Promise
const NS = {
  P: _Promise
};
const A = NS.P;
class C extends A {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}