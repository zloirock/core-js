// a constructor written through an array pattern's alias of a container lands in that container's slot: a
// read of the slot guards the initial value's static and takes the written constructor's off the entry
// carrying its own statics (`Map.groupBy`)
const groupedByArrayPatternAlias = (function () {
  const patBox = { k: Object };
  const [reHomed] = [patBox];
  reHomed.k = Map;
  const { k: { groupBy } } = patBox;
  return groupBy([1, 2], x => x % 2);
})();
export { groupedByArrayPatternAlias };
