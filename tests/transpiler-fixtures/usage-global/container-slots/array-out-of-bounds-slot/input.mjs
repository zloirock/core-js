// An out-of-bounds key has no known element; the nested pattern remains a native read.
const outOfBounds = (function () {
  const { 5: { fromEntries } } = [[12]];
  return fromEntries;
})();
export { outOfBounds };
