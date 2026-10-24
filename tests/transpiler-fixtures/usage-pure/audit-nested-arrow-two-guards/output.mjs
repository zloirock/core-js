import _at from "@core-js/pure/actual/instance/at";
// nested arrow functions each requiring their own polyfill guard: the inner guard
// must be independent of the outer one.
const f = x => {
  var _ref;
  return null == (_ref = fn()) ? void 0 : _at(_ref).call(_ref, 0);
};
const g = y => {
  var _ref2;
  return null == (_ref2 = fn2()) ? void 0 : _at(_ref2).call(_ref2, 1);
};