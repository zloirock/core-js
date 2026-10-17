import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = {
  y: [1, [2]]
};
function effect() {
  return 1;
}
const wrappedInBodylessSlot = function () {
  let out;
  if (out === undefined) var [, _ref] = [box, effect()],
    {
      y: _ref2
    } = box,
    at = _atMaybeArray(_ref2),
    {
      other
    } = _ref2,
    zn = _ref;
  return [at, other, zn];
}();
export { wrappedInBodylessSlot };