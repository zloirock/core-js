// Reverse can move another constructor into the index read by the nested pattern.
const repositionedByReverse = (function () {
  const reversed = [Object, Map];
  reversed.reverse();
  const { 0: { keys } } = reversed;
  return keys;
})();
export { repositionedByReverse };
