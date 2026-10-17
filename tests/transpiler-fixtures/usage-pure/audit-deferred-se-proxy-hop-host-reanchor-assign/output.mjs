import _Map from "@core-js/pure/actual/map/constructor";
import _Object$assign from "@core-js/pure/actual/object/assign";
// gate boundaries: a MULTI-prop host stays un-anchored (single-hop shape only); a DEEPER nest
// re-anchors one level; a binding-resolved computed key re-anchors like the dotted form
let m1, m2, deep, viaKey;
const hopKey = 'Map';
({
  viaKey
} = _Map);
export const assign = _Object$assign;