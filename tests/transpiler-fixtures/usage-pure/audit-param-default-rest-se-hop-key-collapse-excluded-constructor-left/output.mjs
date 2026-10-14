import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// Static extractions off a rest parameter default require closed callers; key/default effects remain
// independent. A logical default whose left's constructor entry is excluded (`.Map`, while `groupBy` keeps its
// own) still decides - the data subset carries `Map` - so the right never runs and leaves with its import: the key
// effect and the collapsed hop stay on the left, read raw, and the static extracts into the body.
let eff = 0;
function k({
  groupBy: _unused,
  ...rest
} = (eff++, _self).Map) {
  let groupBy = _Map$groupBy;
  return [groupBy, rest];
}
k();