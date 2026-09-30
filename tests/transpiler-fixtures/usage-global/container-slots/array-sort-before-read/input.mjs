// Sort may move another constructor into the index read by the nested pattern.
const repositionedBySort = (function () {
  const sorted = [Object, Map];
  sorted.sort();
  const { 0: { isSealed } } = sorted;
  return isSealed;
})();
export { repositionedBySort };
