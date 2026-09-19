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
  const _ref = box.y;
  const at = _atMaybeArray(_ref);
  const {
    other
  } = _ref;
  return [at, other];
}();
const hostSibling = function () {
  const _ref2 = box;
  const _ref3 = _ref2.y;
  const at = _atMaybeArray(_ref3);
  const {
    other
  } = _ref3;
  const {
    keep
  } = _ref2;
  return [at, other, keep];
}();
const twoHops = function () {
  const _ref4 = deep.a.b;
  const at = _atMaybeArray(_ref4);
  const {
    other
  } = _ref4;
  return [at, other];
}();
export { leafSiblings, hostSibling, twoHops };