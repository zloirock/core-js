// Fill can replace the constructor in the array element read by the nested pattern.
const repositionedByFill = (function () {
  const filled = [Object];
  filled.fill(Map);
  const { 0: { isFrozen } } = filled;
  return isFrozen;
})();
export { repositionedByFill };
