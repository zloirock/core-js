import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Object$assign from "@core-js/pure/actual/object/assign";
// a DEFAULT between the leaf and the host decides what the claim reads at all, so the dispatch
// folds BOTH arms: the slot's own value when it is defined, the default when it is not - one read
// of the nav, and the default evaluated only where the source evaluates it. the default's own
// SHAPE does not divide this: a receiver-shaped one folds like any other, because mirroring it
// alone polyfills the arm that may never run and leaves the LIVE read raw. what the mirror still
// owns is the default no dispatch can reach - a parameter's, whose live arm is the caller's value
const src = {
  y: _Object$assign([1, [2]], {
    other: 5
  })
};
const list = [3];
function raise() {
  return [4];
}
const callDefault = function () {
  var _ref;
  const at = _atMaybeArray((_ref = src.y) === void 0 ? raise() : _ref);
  return at;
}();
const receiverDefault = function () {
  var _ref2;
  const flat = _flatMaybeArray((_ref2 = src.y) === void 0 ? list : _ref2);
  return flat;
}();
// ... and a default on the CLAIM itself folds the same way once the leaf flattens: the dispatcher
// answers `it.method` verbatim off a surface that is not the polyfilled one, so it may be undefined
// and the source's default has to fire
const claimDefault = function () {
  var _ref3;
  const _ref4 = src.y;
  const at = (_ref3 = _atMaybeArray(_ref4)) === void 0 ? null : _ref3;
  const {
    other
  } = _ref4;
  return [at, other];
}();
export { callDefault, receiverDefault, claimDefault };