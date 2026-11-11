import _at from "@core-js/pure/actual/instance/at";
// The method default stays between its preceding and following native reads.
// A nested sibling is retained at this level, not mistaken for the method's receiver.
function read(source) {
  var _ref2;
  const {
      y: _ref
    } = {
      y: source
    },
    {
      u: {
        x
      } = fallback()
    } = _ref,
    at = (_ref2 = _at(_ref)) === void 0 ? defaultAt(typeof x) : _ref2,
    {
      after = at
    } = _ref;
  return [x, at, after];
}