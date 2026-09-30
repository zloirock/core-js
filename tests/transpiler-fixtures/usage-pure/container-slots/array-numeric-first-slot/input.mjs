// A numeric object-pattern key selects the first array element for instance dispatch.
const firstSlot = (function () {
  const { 0: { at } } = [[1, 2]];
  return at;
})();
export { firstSlot };
