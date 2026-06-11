import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// a TS parameter-property default anchors the use on the FUNCTION (no AssignmentPattern to
// hoist through), so every memo `var _refN` must land in the ENCLOSING scope - the param
// scope cannot see constructor-body vars. the memos here come from CLONED / SYNTHESIZED
// nodes (the optional method node, the combined-chain spliced receiver), whose missing
// ranges once failed the param-escape check and stranded `var _refN` in the body
// (ReferenceError at `new D()`)
class D {
  constructor(public y = null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref2 = _ref.call(arr))?.call(_ref2, 0)) {}
}
export const d = new D();
class C {
  constructor(private x = _at(_ref3 = state.list)?.call(_ref3, 0)) {}
}
export const c = new C();
// the loop-header twin of the same escape check, with a non-reusable receiver
for (let i = _at(_ref4 = cfg.items)?.call(_ref4, 0); i < limit; i++) use(i);