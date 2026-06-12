import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// historical compose-overlap crash shapes, locked at their healed emissions: a non-poly
// call hop between a non-poly optional inner and a poly outer; a `?.` inside a computed-key
// string literal (the needle deopt is position-aware); an optional MEMBER read over a
// static through `super`
export const r1 = a == null ? void 0 : _at(_ref = a.b.c()).call(_ref, 0);
export const r2 = obj == null ? void 0 : _includes(_ref2 = obj['a?.b']).call(_ref2, z);
class C extends Array {
  m() {
    var _ref3;
    return null == (_ref3 = super.of) ? void 0 : _nameMaybeFunction(_ref3);
  }
}
export const c = new C();