import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Map from "@core-js/pure/actual/map/constructor";
// a proxy-global member chain nested in a literal receiver makes the receiver unsafe to emit twice.
// Capture the literal once, keep the computed-key effect in place, and dispatch the instance method
// from that captured value; the constructor member still rewrites to `_Map`.
const _ref = [1, _Map],
  _ref2 = _ref,
  m = null == _ref2 ? _ref2[""] : (eff(), _flatMaybeArray(_ref2));