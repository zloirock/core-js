// Every caller reaches an inert setter: Map is evaluated but never stored.
// The paired getter still returns Object; global needs only Object.groupBy.
function swap(box) {
  Reflect.set(box, "M", Map);
  return box;
}
use(swap({ get M() { return Object; }, set M(value) {} }).M.groupBy([1, 2], x => x % 2));
