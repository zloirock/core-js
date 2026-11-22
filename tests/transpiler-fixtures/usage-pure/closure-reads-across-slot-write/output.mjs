import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
function fill(target) {
  target.C = _Map;
}
export function read() {
  const box = {
    C: Object
  };
  const held = fill.bind(null, box);
  const capture = () => {
    var _ref;
    return _ref = box.C, _ref === Object ? _Object$groupBy : _ref.groupBy;
  };
  const before = capture();
  held();
  return [before, capture()];
}