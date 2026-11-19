import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// The middle declarator reads its source before the last sibling executes.
if (active) {
  var before = first();
  prefix();
  var ctor = (_globalThis.window.Map, _Map);
  var after = last();
}
export { before, ctor, after };