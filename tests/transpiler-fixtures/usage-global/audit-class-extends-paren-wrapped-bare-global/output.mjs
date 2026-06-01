import "core-js/modules/es.array.at";
// a class extending a parenthesised bare global (`class C extends (Array)`): the paren
// wrapper is peeled and the bare identifier re-resolved as a global so the inherited
// instance method polyfill is injected (parity between transformers)
class C extends Array {
  m() {
    return this.at(0);
  }
}
export { C };