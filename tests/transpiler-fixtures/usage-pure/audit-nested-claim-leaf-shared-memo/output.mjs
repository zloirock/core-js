import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// once a leaf flattens onto its twin, EVERY claim in it reads the shared memo - a claim spelling
// the hop for itself would fire that getter a second time. the claims may take the leaf whole, and
// then the rewritten declarator binds nothing and leaves with the pattern. a COMPUTED sibling
// travels (it keeps its key node and its position); a REST one gathers what was not named and stays
const box = {
  y: [1, [2]],
  keep: 3
};
const twoClaims = function () {
  const _ref = box.y;
  const at = _atMaybeArray(_ref);
  const flat = _flatMaybeArray(_ref);
  return [at, flat];
}();
const claimAndSymbol = function () {
  const _ref2 = box.y;
  const at = _atMaybeArray(_ref2);
  const it = _getIteratorMethod(_ref2);
  return [at, it];
}();
const computedSibling = function () {
  const k = 'other';
  const _ref3 = box.y;
  const at = _atMaybeArray(_ref3);
  const {
    [k]: dyn
  } = _ref3;
  return [at, dyn];
}();
const restSibling = function () {
  const {
    y: {
      at,
      ...rest
    }
  } = box;
  return [at, rest];
}();
export { twoClaims, claimAndSymbol, computedSibling, restSibling };