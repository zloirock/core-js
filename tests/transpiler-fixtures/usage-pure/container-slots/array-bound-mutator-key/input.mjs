// A const-bound method key can name a repositioning method before the nested slot read.
const repositionedByBoundKey = (function () {
  const boundKeyBox = [Object, Map];
  const methodName = 'reverse';
  boundKeyBox[methodName]();
  const { 0: { groupBy } } = boundKeyBox;
  return groupBy;
})();
export { repositionedByBoundKey };
