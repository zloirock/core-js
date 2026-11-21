import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
export function read(override) {
  function fill(target) {
    target.C = _Map;
  }
  if (override) fill.apply = () => {};
  const box = {
    C: Object
  };
  fill.apply(null, [box]);
  const {
      C: _ref
    } = box,
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy([7], Boolean);
}