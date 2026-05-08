import _at from "@core-js/pure/actual/instance/at";
// `class Sub extends NS.Base` with NS a const-bound namespace object: the subclass-
// index must resolve `NS.Base` to `Base` so Sub is registered as a subclass of Base.
// without this, `s.box = "..."` (external write to a Sub instance) fails to fold into
// Base's `box` field type, leaving the inherited field falsely narrow at array-specific
// polyfill while runtime sees a string
class Base {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
const NS = {
  Base
};
class Sub extends NS.Base {}
const s = new Sub();
s.box = "stringified";
s.first();