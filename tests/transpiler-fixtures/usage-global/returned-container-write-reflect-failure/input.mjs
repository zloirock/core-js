// The descriptor makes Reflect.set fail, but descriptor-state analysis bails.
// Keep both constructor candidates; pure preserves the original receiver read.
function swap(box) {
  Object.defineProperty(box, "M", { writable: false });
  Reflect.set(box, "M", Map);
  return box;
}
use(swap({ M: Object }).M.groupBy([1, 2], x => x % 2));
