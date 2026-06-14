// a method call inside an INSTANCE field initializer runs at construction (new-time), a
// deferred context - so a later external write to the captured field is observable when it runs and
// must widen the type. bounding it as straight-line kept the narrow -> here the post-write call
// resolves generic `_at`, not an array-specific Maybe
class C {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
const c = new C();
class D {
  f = c.getFirst();
}
c.items = "string";
new D();
