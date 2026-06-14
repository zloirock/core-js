import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// TS-cast bare proxy-global receiver composed with hop threading: `(globalThis as any)` is
// substituted to `_globalThis` (through the cast) while the surviving `.map(...)` hop is still
// threaded onto the inner result. both plugins resolve the receiver the same single way
null == (_ref2 = _flatMaybeArray(_ref = _globalThis)) ? void 0 : _at(_ref3 = _mapMaybeArray(_ref4 = _ref2.call(_ref)).call(_ref4, x => x * 2))?.call(_ref3, 0);