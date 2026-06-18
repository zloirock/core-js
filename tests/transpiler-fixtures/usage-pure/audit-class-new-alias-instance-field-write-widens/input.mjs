// `const D = C` aliases the class; `new D()` is an UNBOUND instance whose field write
// `new D().items = "string"` must count toward C's instance field-flow fold (D instantiates C).
// so the read in getFirst() sees `number[] | string` and resolves generic `_at`, not an
// array-specific Maybe that would crash on the String value at runtime
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
const D = C;
new D().items = "string";
new C().getFirst();
