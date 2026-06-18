// `(new C() as any).getFirst()` is a TS-cast-wrapped unbound `new C()` chain call that still
// observes the earlier `new C().items = "string"` write; the write widens C's field-flow fold so
// getFirst() resolves generic `_at`, not an array-specific Maybe
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
new C().items = "string";
(new C() as any).getFirst();
