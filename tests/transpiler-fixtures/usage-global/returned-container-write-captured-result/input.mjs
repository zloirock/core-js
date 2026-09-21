// A stored call result reads the replacement installed before return.
function swap(box) {
  Reflect.defineProperty(box, "M", { value: Map });
  return box;
}
const result = swap({ M: Object });
use(result.M.groupBy([1, 2], x => x % 2));
