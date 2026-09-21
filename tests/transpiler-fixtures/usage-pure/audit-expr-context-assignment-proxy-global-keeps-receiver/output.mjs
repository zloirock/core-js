import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
var _ref;
// A consumed destructuring assignment yields its original receiver.
// The retained receiver keeps its global polyfill and the static binding is still served.
function eff() {}
let Map, Set;
export const host = (_ref = (eff(), _globalThis), Map = _Map, _ref);
// ... the discriminating twin: as a non-tail sequence element nobody reads what the assignment
// yields, so the consume runs and the receiver drops with the destructure
export const r = (eff(), Set = _Set, typeof Set);
export { Map, Set };