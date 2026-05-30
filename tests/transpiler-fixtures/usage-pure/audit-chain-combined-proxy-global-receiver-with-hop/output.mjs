import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// receiver substitution composed with intermediate-hop threading: a proxy-global receiver
// (`globalThis`) is substituted to `_globalThis` inside the memoized receiver while the `.map(...)`
// hop is threaded onto the inner result - both behaviors apply within one combine
null == (_ref = _globalThis.list) || null == (_ref2 = _flatMaybeArray(_ref)) ? void 0 : _at(_ref3 = _mapMaybeArray(_ref4 = _ref2.call(_ref)).call(_ref4, x => x * 2))?.call(_ref3, 0);