import _at from "@core-js/pure/actual/instance/at";
const crossFamilyFold = function () {
  const nb = {
    y: [1, 2]
  };
  const {
      y: _ref = 'ab'
    } = nb,
    at = _at(_ref),
    {
      other
    } = _ref;
  return [at, other];
}();
export { crossFamilyFold };