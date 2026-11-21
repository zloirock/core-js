import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
function fill(box) {
  if (box) box.C = _Map;
}
export function read(flag) {
  const box = {
    C: Object
  };
  if (flag) fill(box);
  const {
      C: _ref
    } = box,
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy([7], Boolean);
}