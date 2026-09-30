// A folded concatenated method key names a mutator that can reposition array elements.
const repositionedByConcatKey = (function () {
  const concatBox = [Object, Map];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  concatBox['rev' + 'erse']();
  const { 0: { isFrozen } } = concatBox;
  return isFrozen;
})();
export { repositionedByConcatKey };
