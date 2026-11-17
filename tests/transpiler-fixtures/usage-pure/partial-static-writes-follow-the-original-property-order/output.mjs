import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
var _ref, _ref2;
// Partial writes follow the original property order, including before a missing slot.
// The receiver prefix observes state before either target is written.
let first, second;
observe(first);
first = (({} = _ref = _globalThis.window).Map, _Map);
({
  missing: second
} = _ref);
observe(first);
({
  missing: second
} = _globalThis.window);
first = _Map;
first = (({
  left: second
} = _ref2 = _globalThis.window).Map, _Map);
({
  right: second
} = _ref2);
export { first, second };