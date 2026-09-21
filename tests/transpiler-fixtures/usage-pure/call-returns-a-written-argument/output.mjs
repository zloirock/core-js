import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
// A callee hands its CONTAINER argument back unchanged only where the parameter reached the return
// and nothing else: a member write, a handout to anything that can write and a write through a local
// alias each replace a slot the reader would otherwise trust, and the call site's literal stops
// describing what came back. A callee keeping no other reference still resolves.
function viaMember(box, key, value) {
  box[key] = value;
  return box;
}
function viaBuiltin(box, key, value) {
  _Object$defineProperty(box, key, {
    value: value,
    configurable: true
  });
  return box;
}
function viaAlias(box, key, value) {
  const alias = box;
  alias[key] = value;
  return box;
}
function clean(box) {
  return box;
}
export const declinedMember = viaMember({
  M: Array
}, 'M', _Map).M.groupBy([1], x => x);
export const declinedBuiltin = viaBuiltin({
  S: Array
}, 'S', _Set).S.union(new _Set());
export const declinedAlias = viaAlias({
  P: Array
}, 'P', _Promise).P.withResolvers();
export const resolved = _Array$of(2);