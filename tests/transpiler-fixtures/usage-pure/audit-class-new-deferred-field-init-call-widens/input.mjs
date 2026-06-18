// `new C().getFirst()` inside an instance field initializer runs at construction time (deferred),
// so a later external `new C().items = "string"` write is observable when it runs and must widen
// the field type. the read resolves generic `_at`, not an array-specific Maybe
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
class D {
  f = new C().getFirst();
}
new C().items = "string";
new D();
