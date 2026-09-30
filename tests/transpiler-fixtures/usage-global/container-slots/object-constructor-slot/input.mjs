// An object slot holding Object exposes its named static through a nested pattern.
const constructorUnderObjectKey = (function () {
  const { k: { entries } } = { k: Object };
  return entries;
})();
export { constructorUnderObjectKey };
