import _at from "@core-js/pure/actual/instance/at";
// module-wide scan catches external writes like `c.box = "str"`. receiver statically
// resolves to an instance of C, so the write joins the flow fold IF observed by a call.
// the trailing `c.first()` is the call site; the write at position before it makes the
// String candidate observable. union of Array|String collapses, `.at(0)` falls back to
// generic `_at`. without a trailing call, temporal flow would exclude the write (no
// call after it) and narrow stays array - see audit-class-field-write-after-final-call
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
const c = new C();
c.box = "hello";
c.first();