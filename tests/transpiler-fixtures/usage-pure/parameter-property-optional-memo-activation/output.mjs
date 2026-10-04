import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref4;
// Optional chained dispatches in a parameter-property default keep all receiver and
// method memos in that default's activation. The parameter cannot see body vars, and
// separate constructions must never share an enclosing memo slot.
class D {
  constructor(public y = (() => {
    var _ref, _ref2;
    return null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref2 = _ref.call(arr))?.call(_ref2, 0);
  })()) {}
}
export const d = new D();
class C {
  constructor(private x = (() => {
    var _ref3;
    return _at(_ref3 = state.list)?.call(_ref3, 0);
  })()) {}
}
export const c = new C();
// the loop-header twin of the same escape check, with a non-reusable receiver
for (let i = _at(_ref4 = cfg.items)?.call(_ref4, 0); i < limit; i++) use(i);