// A return before the store can still expose Object.groupBy.
function swap(box) {
  if (flag) return box;
  Object.assign(box, { M: Map });
  return box;
}
use(swap({ M: Object }).M.groupBy([1, 2], x => x % 2));
