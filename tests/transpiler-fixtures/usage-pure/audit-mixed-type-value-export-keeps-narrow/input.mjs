// mixed `export { type C, D }` - per-specifier `type` modifier on C (tsc-elided), bare
// spec on D (runtime value-export). C narrowing survives via the per-spec exportKind
// filter; D leak would still bail D's closure-narrow if relevant (here D has no narrow scope)
class C {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
class D {}
export { type C, D };