import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// gate boundaries: a MULTI-prop host stays un-anchored (single-hop shape only); a DEEPER nest
// re-anchors one level; a binding-resolved computed key re-anchors like the dotted form
let m1, m2, deep, viaKey;
({
  Map: {
    m1
  },
  Set: {
    m2
  }
} = _globalThis);
export const getOwnPropertyNames = _Object$getOwnPropertyNames;