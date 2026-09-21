// A conditional store can retain the original Object receiver.
function swap(box) {
  if (flag) Reflect.set(box, "M", Map);
  return box;
}
use(swap({ M: Object }).M.groupBy([1, 2], x => x % 2));
