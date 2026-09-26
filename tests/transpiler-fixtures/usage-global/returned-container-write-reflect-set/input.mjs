// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  Reflect.set(box, 'M', Map);
  return box;
}
use(swap({ M: Object }).M.groupBy([1, 2], x => x % 2));
