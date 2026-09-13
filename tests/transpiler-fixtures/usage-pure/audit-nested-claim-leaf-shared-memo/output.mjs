import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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