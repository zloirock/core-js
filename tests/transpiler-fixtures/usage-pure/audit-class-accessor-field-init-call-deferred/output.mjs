import _at from "@core-js/pure/actual/instance/at";
// auto-accessor variant: an auto-accessor field initializer (`accessor f = ...`) runs at
// construction (new-time) like a regular instance field, so a method call inside it is a deferred
// context - a later external write to the captured field reaches it and must widen the type ->
// generic `_at`, not an array-specific Maybe. a static auto-accessor would stay class-eval (narrow)
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const c = new C();
class D {
  accessor f = c.getFirst();
}
c.items = "string";
new D();