import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A getter returning an array is read once for the nested method before the outer sibling.
// The inner-sibling control contains an ordinary object with a numeric at property: both
// of its values stay native because that receiver needs no instance polyfill.
let reads = 0;
const src = {
  get y() {
    reads += 1;
    return [1, [2]];
  },
  keep: 1
};
const hostSibling = function () {
  const _ref = src;
  const at = _atMaybeArray(_ref.y);
  const {
    keep
  } = _ref;
  return [at, keep];
}();
const innerSibling = function () {
  const box = {
    y: {
      at: 1,
      other: 2
    }
  };
  const {
    y: {
      at,
      other
    }
  } = box;
  return [at, other];
}();
export { hostSibling, innerSibling, reads };