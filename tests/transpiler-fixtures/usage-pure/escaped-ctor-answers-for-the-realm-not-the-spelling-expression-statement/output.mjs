import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A handed-out local scalar named Map does not widen the realm constructor.
function hand(x) {
  _globalThis.taken = x;
}
{
  let Map = 1;
  hand(Map);
}
new _Map();