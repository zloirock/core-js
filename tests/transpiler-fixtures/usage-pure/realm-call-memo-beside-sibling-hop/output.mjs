import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a call returning the realm, with an effect of its own, destructured beside a sibling hop: the
// whole init memoizes once for the sibling and the claim reads the realm the call returns. the memo
// already ran the call, so no extraction replays it as a prefix - that would run it twice. a
// prefixed init and a defaulted sibling take the same shape
function mk() {
  eff();
  return _globalThis;
}
const _ref = mk();
const flat = _flatMaybeArray(_globalThis.Array.prototype);
const {
  Object: o
} = _ref;
const _ref2 = (eff(), mk());
const at = _atMaybeString(_globalThis.String.prototype);
const {
  z = 1
} = _ref2;