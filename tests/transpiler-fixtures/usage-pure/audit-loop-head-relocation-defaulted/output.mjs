import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// ... and a claim carrying its OWN default: `const` cannot carry the guard's test ref as an
// initializer-less declarator, so under a relocated `const` it takes the hoisted `var` every
// `const` declaration's guard takes
const defaulted = function () {
  let seen;
  for (const _ref2 of [[1, 2]]) {
    var _ref;
    const at = (_ref = _atMaybeArray(_ref2)) === void 0 ? fb : _ref;
    seen = at;
  }
  return seen;
}();
export { defaulted };