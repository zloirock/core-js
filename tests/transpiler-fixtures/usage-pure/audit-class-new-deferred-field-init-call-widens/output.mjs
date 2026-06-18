import _at from "@core-js/pure/actual/instance/at";
// `new C().getFirst()` inside an instance field initializer runs at construction time (deferred),
// so a later external `new C().items = "string"` write is observable when it runs and must widen
// the field type. the read resolves generic `_at`, not an array-specific Maybe
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
class D {
  f = new C().getFirst();
}
new C().items = "string";
new D();