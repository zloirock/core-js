import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _self from "@core-js/pure/actual/self";
var _ref;
// `(self?.foo).flat?.(0);` - parity check with paren-wrapped `globalThis` chain shape but
// with a different POSSIBLE_GLOBAL_OBJECTS leaf (`self`). asserts the top-level peel
// applies uniformly across the proxy-global set (globalThis / self / window / global) -
// not gated on a specific leaf name.
_flatMaybeArray(_ref = _self.foo)?.call(_ref, 0);