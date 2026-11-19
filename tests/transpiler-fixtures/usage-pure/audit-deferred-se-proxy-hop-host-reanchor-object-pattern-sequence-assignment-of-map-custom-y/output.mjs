import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
// a deferred-SE destructure host (a `({ hop: { leaf } } = root)` assignment buried in a consumed
// init's sequence prefix) must re-anchor exactly like the plain statement form even though no
// leaf resolves: each emitter re-enters the anchored-plan trigger on its own re-traversal.
let customY;
({
  customY
} = _Map);
export const of = _Array$of;