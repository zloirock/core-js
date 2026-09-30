// A folded computed pattern key detaches the repositioning method from its array receiver.
const patternConcatDetaches = (function () {
  const patternConcatBox = [Object, Map];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  const { ['rev' + 'erse']: pm } = patternConcatBox;
  pm.call(patternConcatBox);
  const { 0: { preventExtensions } } = patternConcatBox;
  return preventExtensions;
})();
export { patternConcatDetaches };
