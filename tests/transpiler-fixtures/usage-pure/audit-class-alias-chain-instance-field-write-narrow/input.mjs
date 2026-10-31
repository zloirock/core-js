// const D = C; const E = D; new E().items = "X" - multi-hop alias chain. instance writes
// via the leaf alias `E` must widen C's field fold the same as a direct `const D = C` alias
// does. without walking the alias chain, the leaf alias's `new E()` instance is not recognized
// as a C instance and the external write drops from the field-flow union - unsound narrow
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
const D = C;
const E = D;
const e = new E();
e.items = "string";
new C().getFirst();
