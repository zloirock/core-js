import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3;
// chain-combined `recv.flat?.().includes(1)` where the inner receiver is a CALL result (not a
// bare identifier). the `?.` guards the inner CALL, not the `.flat` access, so a nullish receiver
// must THROW on the `.flat` read like native - the emit must NOT prepend a `null == receiver`
// test that would swallow the throw into void 0. the receiver evaluates exactly once: its
// assignment folds into the method-get (`_flat(_ref = getArr())`) rather than a separate slot.
function getArr() {
  return [1, 2];
}
null == (_ref2 = _flatMaybeArray(_ref = getArr())) ? void 0 : _includesMaybeArray(_ref3 = _ref2.call(_ref)).call(_ref3, 1);