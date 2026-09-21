// Destructuring the returned slot observes its replacement, not the initial Object.
function swap(box) {
  Object.assign(box, { M: Map });
  return box;
}
const { M: { groupBy } } = swap({ M: Object });
use(groupBy([1, 2], x => x % 2));
