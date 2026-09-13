import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A later unconditional var declaration overwrites an earlier conditional alias.
// Its static read follows the later value even when the host binds the first declaration.
export function read(flag) {
  if (flag) {
    var M = _Promise;
  }
  var M = _Map;
  return typeof _Map$groupBy;
}