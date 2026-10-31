// A stored repositioning method may change the array whose slot is read later.
const repositionedByStoredMethod = (function () {
  const storedBox = [Object, Map];
  const m = storedBox.reverse;
  m.call(storedBox);
  const { 0: { groupBy } } = storedBox;
  return groupBy;
})();
export { repositionedByStoredMethod };
