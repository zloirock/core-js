import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// TS-cast receiver kept verbatim composed with hop threading: the `(globalThis as any)` receiver
// stays raw in the memo (substituting through the cast would diverge from unplugin) while the
// `.map(...)` hop is still threaded onto the inner result
null == (_ref2 = _flatMaybeArray(_ref = globalThis as any)) ? void 0 : _at(_ref3 = _mapMaybeArray(_ref4 = _ref2.call(_ref)).call(_ref4, x => x * 2))?.call(_ref3, 0);