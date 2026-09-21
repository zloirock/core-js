// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  Reflect.apply(Object.assign, null, [box, { M: Map }]);
  return box;
}
use(swap({ M: Object }).M.groupBy([1, 2], x => x % 2));
