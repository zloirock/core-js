// A folded slice key does not invalidate the array element read by the nested pattern.
const foldedReadOnlyKeyStillResolves = (function () {
  const foldedBox = [Object];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  foldedBox['sli' + 'ce'](0);
  const { 0: { seal } } = foldedBox;
  return seal;
})();
export { foldedReadOnlyKeyStillResolves };
