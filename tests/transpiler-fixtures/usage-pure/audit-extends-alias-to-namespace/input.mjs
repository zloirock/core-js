// identifier alias whose init points at a user-namespace member: `const A = NS.P`.
// `resolveSuperClassName`'s non-Identifier init fallback delegates to the unified primitive,
// so the chain `A -> NS.P -> Promise` composes end-to-end. `super.try(...)` routes through Promise
const NS = { P: Promise };
const A = NS.P;
class C extends A {
  static run() { return super.try(() => 1); }
}
