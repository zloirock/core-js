import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// The plain initializer reads the window once before extracting the constructor.
function root() {
  visit();
  return _globalThis;
}
export const ctor = (root().window.Map, _Map);