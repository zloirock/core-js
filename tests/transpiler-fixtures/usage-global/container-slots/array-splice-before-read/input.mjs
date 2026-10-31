// Splice replaces the element read by the nested pattern with another constructor.
const repositionedBySplice = (function () {
  const spliced = [Object];
  spliced.splice(0, 1, Map);
  const { 0: { entries } } = spliced;
  return entries;
})();
export { repositionedBySplice };
