import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// the symbol leaf extracts through the helper wherever the extraction OWNS the hop read: a sole
// slot, and a slot beside a HOST sibling too - the leaf leaves and the emptied hop prunes with it,
// so the sibling reads its own key. a DEFAULT rides along rather than bounding it: what the slot
// answers under polyfill-always-wins is the helper's result, so the guard folds around the call -
// on the slot and on the leaf alike. the key swap is the ANCHORED family's answer, not this one
const symbolSole = function () {
  const box = {
    inner: [1]
  };
  const it = _getIteratorMethod(box.inner);
  return it;
}();
const symbolSibling = function () {
  const box = {
    inner: [1],
    keep: 2
  };
  const it = _getIteratorMethod(box.inner);
  const {
    keep
  } = box;
  return [it, keep];
}();
const symbolDefault = function () {
  var _ref;
  const box = {
    inner: [1],
    keep: 2
  };
  const it = _getIteratorMethod((_ref = box.inner) === void 0 ? [] : _ref);
  const {
    keep
  } = box;
  return [it, keep];
}();
const symbolLeafDefault = function () {
  var _ref2;
  const box = {
    inner: [1]
  };
  function fallback() {
    return null;
  }
  const it = (_ref2 = _getIteratorMethod(box.inner)) === void 0 ? fallback : _ref2;
  return it;
}();
export { symbolSole, symbolSibling, symbolDefault, symbolLeafDefault };