import _at from "@core-js/pure/actual/instance/at";
// a method call inside an INSTANCE field initializer runs at construction (new-time), a
// deferred context - so a later external write to the captured field is observable when it runs and
// must widen the type. bounding it as straight-line kept the narrow -> here the post-write call
// resolves generic `_at`, not an array-specific Maybe
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const c = new C();
class D {
  f = c.getFirst();
}
c.items = "string";
new D();