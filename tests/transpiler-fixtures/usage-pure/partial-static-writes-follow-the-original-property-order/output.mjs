import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
var _ref, _ref2, _ref3;
// Partial writes follow the original property order, including before a missing slot.
// The receiver prefix observes state before either target is written.
let first, second;
observe(first);
first = (({} = _ref = _globalThis.window).Map, _Map);
({
  missing: second
} = _ref);
_ref2 = (observe(first), _globalThis.window), {
  missing: second
} = _ref2, first = _Map;
_ref3 = _globalThis.window, {
  left: second
} = _ref3, first = _Map, {
  right: second
} = _ref3;
export { first, second };