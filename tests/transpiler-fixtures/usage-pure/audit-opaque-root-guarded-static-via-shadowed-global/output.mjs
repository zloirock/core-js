import _at from "@core-js/pure/actual/instance/at";
// NEGATIVE: a binding SHADOWING the global name (a parameter) keeps the raw identifier - the
// buried-global proof and the substitution both respect scope
function shadowWrap(globalThis) {
  var _ref, _ref2;
  return null == (_ref = (x => x)(globalThis)?.window?.self) ? void 0 : _at(_ref2 = _ref.Array.of(28)).call(_ref2, 0);
}
export const viaShadowedGlobal = shadowWrap;