import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = {
  y: [1, [2]]
};
function effect() {
  return 1;
}
const wrappedAfterAnEffect = function () {
  const zLead = effect(),
    [,] = [box],
    _ref = box.y,
    at = _atMaybeArray(_ref),
    {
      other
    } = _ref;
  return [zLead, at, other];
}();
export { wrappedAfterAnEffect };