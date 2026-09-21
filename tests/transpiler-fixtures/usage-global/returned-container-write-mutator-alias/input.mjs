// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  const install = Object.defineProperty; install(box, 'M', { value: Map });
  return box;
}
use(swap({ M: Object }).M.groupBy([1, 2], x => x % 2));
