import _globalThis from "@core-js/pure/actual/global-this";
// a destructure-ASSIGNMENT used as an EXPRESSION (not a statement): the full-consume emit only fires
// in statement position, so here it bails and leaves the assignment in place. the dropped-receiver
// skip must therefore NOT fire - the `globalThis` root stays and is polyfilled to `_globalThis` (a raw
// root would ReferenceError on engines lacking it). discriminating negative against the statement-
// position assignment, which drops the root.
function eff() {}
let Map;
export const r = ({
  Map
} = (eff(), _globalThis), typeof Map);