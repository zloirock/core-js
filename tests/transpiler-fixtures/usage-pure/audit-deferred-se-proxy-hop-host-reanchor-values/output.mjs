import _Map from "@core-js/pure/actual/map/constructor";
import _Object$values from "@core-js/pure/actual/object/values";
// gate boundaries: a MULTI-prop host stays un-anchored (single-hop shape only); a DEEPER nest
// re-anchors one level; a binding-resolved computed key re-anchors like the dotted form
let m1, m2, deep, viaKey;
({
  customY: {
    deep
  }
} = _Map);
export const values = _Object$values;