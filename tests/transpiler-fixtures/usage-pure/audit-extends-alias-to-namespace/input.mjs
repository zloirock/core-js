// two-step chain: `const A = NS.P` where `NS.P` is itself an alias to Promise via the
// user-namespace. plugin composes the chain A -> NS.P -> Promise and polyfills super.try
// accordingly. works uniformly regardless of how the alias was introduced (direct Identifier,
// proxy-global member chain, or object-literal namespace)
const NS = { P: Promise };
const A = NS.P;
class C extends A {
  static run() { return super.try(() => 1); }
}
