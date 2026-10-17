// a class extending a parenthesised bare global (`class C extends (Array)`): the paren
// wrapper is peeled and the bare identifier re-resolved as a global so the inherited
// instance method polyfill is injected (parity between transformers). the class stays
// module-local: leaking the binding makes `this` an unprovable receiver, and the resulting
// untyped over-injection would cover the peeling this fixture is here to show
class C extends (Array) {
  m() { return this.at(0); }
}
new C().m();
