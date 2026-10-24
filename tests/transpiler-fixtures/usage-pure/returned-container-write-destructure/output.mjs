import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Destructuring the returned slot observes its replacement, not the initial Object.
function swap(box) {
  _Object$assign(box, {
    M: _Map
  });
  return box;
}
const {
    M: _ref
  } = swap({
    M: Object
  }),
  groupBy = _ref === _Map ? _Map$groupBy : _ref.groupBy;
use(groupBy([1, 2], x => x % 2));