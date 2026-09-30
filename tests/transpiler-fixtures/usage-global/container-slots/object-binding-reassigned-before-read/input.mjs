// A dominating replacement of the whole container determines the slot read by the pattern.
const containerWhollyReassigned = (function () {
  let swapped = { k: Object };
  swapped = { k: Map };
  const { k: { groupBy } } = swapped;
  return groupBy;
})();
export { containerWhollyReassigned };
