import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// Closed true callers settle the conditional constructor aliases. Hoisted var declarations
// and plain writes serve the same direct statics; an instance-method name remains a property read.
function viaWrite(c) {
  let M;
  if (c) M = _Map;
  return _Map$groupBy([1, 2], x => x % 2);
}
function viaDecl(c) {
  if (c) {
    var P = _Promise;
  }
  return typeof _Promise$try;
}
// An instance-method name stays a property read on the selected constructor.
function viaInstanceKey(c) {
  let S;
  if (c) S = _Set;
  return typeof _Set.union;
}
export const r = [viaWrite(true), viaDecl(true), viaInstanceKey(true)];