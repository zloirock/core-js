import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A nested leaf with siblings uses one receiver capture for the method and the remaining
// properties, at any depth. An outer sibling requires a capture of the root as well; the nested
// read and outer sibling then retain source property order.
const box = {
  y: [1, [2]],
  keep: 3
};
const deep = {
  a: {
    b: [1, [2]]
  }
};
const leafSiblings = function () {
  const {
      y: _ref
    } = box,
    at = _atMaybeArray(_ref),
    {
      other
    } = _ref;
  return [at, other];
}();
const hostSibling = function () {
  const _ref3 = box,
    {
      y: _ref2
    } = _ref3,
    at = _atMaybeArray(_ref2),
    {
      other
    } = _ref2,
    {
      keep
    } = _ref3;
  return [at, other, keep];
}();
const twoHops = function () {
  const {
      a: {
        b: _ref4
      }
    } = deep,
    at = _atMaybeArray(_ref4),
    {
      other
    } = _ref4;
  return [at, other];
}();
export { leafSiblings, hostSibling, twoHops };