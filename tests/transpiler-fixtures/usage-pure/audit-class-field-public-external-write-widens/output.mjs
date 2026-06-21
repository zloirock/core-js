import _at from "@core-js/pure/actual/instance/at";
// an external write `c.box = "str"` on a statically-resolved instance of C joins the field
// flow fold ONLY if a later call observes it. the trailing `c.first()` is that call, so the
// String candidate becomes observable, Array|String collapses, `.at(0)` falls back to generic
// `_at`. without a trailing call the write is excluded - see audit-class-field-write-after-final-call
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