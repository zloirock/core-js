// Unshift changes which constructor occupies the index read by the nested pattern.
const repositionedByUnshift = (function () {
  const shifted = [Object];
  shifted.unshift(Map);
  const { 0: { groupBy } } = shifted;
  return groupBy;
})();
export { repositionedByUnshift };
