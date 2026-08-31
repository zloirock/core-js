import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// a SHADOWED realm name holds the user's binding, not the surface: no claim resolves through it,
// no hop folds off it, and the source's own `?.` keeps its guard - the surface classifiers ask
// the binding-aware canon, never the file census alone. the unshadowed twin is the negative that
// keeps the fold and the claim alive.
export function bare(self) {
  var _ref;
  return null == (_ref = self.globalThis) ? void 0 : _nameMaybeFunction(_ref.Map);
}
export function seq(self) {
  var _ref2;
  let d = 0;
  return null == (_ref2 = (d++, self.globalThis)) ? void 0 : _nameMaybeFunction(_ref2.Map);
}
export function nested(self) {
  var _ref3;
  let c = 0,
    d = 0;
  return null == (_ref3 = (d++, c++, self.globalThis)) ? void 0 : _nameMaybeFunction(_ref3.Map);
}
export function shadowedWindow(window) {
  var _ref4;
  let c = 0,
    d = 0;
  return null == (_ref4 = (d++, c++, window.self)) ? void 0 : _nameMaybeFunction(_ref4.Map);
}

// NEGATIVE: the unshadowed twin folds and claims
export function unshadowed() {
  let c = 0,
    d = 0;
  return null == (d++, c++, _self) ? void 0 : _nameMaybeFunction(_Map);
}