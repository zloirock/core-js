import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// class default type-param: `class C<T = string[]>` instantiated as bare `C` (no args) — does the default propagate to `findClassMember` so `inst.x.at(0)` resolves to Array?
class C<T = string[]> {
  x: T = null!;
}
declare const c: C;
_atMaybeArray(_ref = c.x).call(_ref, 0);