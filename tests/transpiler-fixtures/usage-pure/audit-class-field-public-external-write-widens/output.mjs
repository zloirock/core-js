import _at from "@core-js/pure/actual/instance/at";
// module-wide scan catches external writes like `c.box = "str"`. receiver statically
// resolves to an instance of C, so the write joins the flow fold. union of Array|string
// collapses, `.at(0)` falls back to generic `_at`
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
const c = new C();
c.box = "hello";