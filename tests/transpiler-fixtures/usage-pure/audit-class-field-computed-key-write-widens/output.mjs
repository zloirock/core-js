import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a computed member key evaluates in the OUTER `this`, even inside a skipped this-rebinding
// subtree (a babel ObjectMethod, a nested class member). the `this.a = ...` / `this.b = ...` writes
// buried in those keys must still widen the fields -> generic `_at` / `_includes` for both (the
// methods exist on the foreign string value too), not array-specific Maybe variants
class C {
  a = [1];
  b = [2];
  m() {
    var _ref, _ref2;
    const o = {
      [this.a = "s"]() {}
    };
    class D {
      [this.b = "s"]() {}
    }
    return [_at(_ref = this.a).call(_ref, 0), _includes(_ref2 = this.b).call(_ref2, 2)];
  }
}