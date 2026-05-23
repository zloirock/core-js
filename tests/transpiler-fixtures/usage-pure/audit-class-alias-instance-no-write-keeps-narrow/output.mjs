import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `const D = C; new D()` without any field reassignment - construction-only alias.
// alias-instance closure widens the constructorNames set but the field-flow scan finds
// zero external writes, so the init-driven narrow (`items = [1, 2, 3]`) survives. confirms
// the relaxed classifier only INVALIDATES when there's an actual write through the alias
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
const D = C;
new D();
new C().getFirst();