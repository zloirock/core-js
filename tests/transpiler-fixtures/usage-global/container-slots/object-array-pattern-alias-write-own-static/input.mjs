// a constructor written through an array pattern's alias of a container lands in that container's slot: a
// read of the slot loads the written constructor's own static (`Map.groupBy`) beside the initial value's
const groupedByArrayPatternAlias = (function () {
  const patBox = { k: Object };
  const [reHomed] = [patBox];
  reHomed.k = Map;
  const { k: { groupBy } } = patBox;
  return groupBy([1, 2], x => x % 2);
})();
export { groupedByArrayPatternAlias };
