import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a DEFAULT on the slot is CARRIED, not mirrored: the twin's receiver folds both arms off one read -
// the slot's own value when it is defined, the default when it is not - so the claim is polyfilled
// on the arm that actually runs. mirroring the default alone polyfilled the arm that may never run
// and left the live one raw, which is what the sibling rows below would have lost. this is the pure
// route's own shape: usage-global restructures nothing, and what it derives is its own question
const src = {
  y: [1, [2]],
  a: {
    b: [1, [2]]
  }
};
const spare = [3];
const siblings = function () {
  var _ref;
  const _ref2 = (_ref = src.y) === void 0 ? spare : _ref;
  const at = _atMaybeArray(_ref2);
  const flat = _flatMaybeArray(_ref2);
  return [typeof at, typeof flat];
}();
// ... a plain sibling rides the same memo - it reads the fold, not the receiver a second time
const withPlainSibling = function () {
  var _ref3;
  const _ref4 = (_ref3 = src.y) === void 0 ? spare : _ref3;
  const at = _atMaybeArray(_ref4);
  const {
    other
  } = _ref4;
  return [typeof at, other];
}();
// ... and the fold is what makes an EFFECTFUL default expressible at all: the call runs only where
// the source runs it, which a mirror could not promise
let calls = 0;
function raise() {
  calls += 1;
  return [3];
}
const effectfulDefault = function () {
  var _ref5;
  const _ref6 = (_ref5 = src.a.b) === void 0 ? raise() : _ref5;
  const at = _atMaybeArray(_ref6);
  const flat = _flatMaybeArray(_ref6);
  return [typeof at, typeof flat, calls];
}();
export { siblings, withPlainSibling, effectfulDefault };