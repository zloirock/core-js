import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = {
  y: [1, [2]]
};
const wrapped = function () {
  const _ref = box.y;
  const at = _atMaybeArray(_ref);
  const [{
    other
  }] = [_ref];
  return [at, other];
}();
export { wrapped };