import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// a destructure-ASSIGNMENT whose own value is CAPTURED: the consume would hand its reader the
// ponyfill where the source hands it the receiver, so the emit bails and leaves the assignment in
// place. the dropped-receiver skip must therefore NOT fire - the `globalThis` root stays and is
// polyfilled to `_globalThis` (a raw root would ReferenceError on engines lacking it)
function eff() {}
let Map, Set;
export const host = {
  Map
} = (eff(), _globalThis);
// ... the discriminating twin: as a non-tail sequence element nobody reads what the assignment
// yields, so the consume runs and the receiver drops with the destructure
export const r = (eff(), Set = _Set, typeof Set);
export { Map, Set };