// An object pattern binds the contained object whose slot is subsequently replaced.
const escapedByObjectPatternInit = (function () {
  const objPatBox = { k: Object };
  const { taken } = { taken: objPatBox };
  taken.k = Map;
  const { k: { fromEntries } } = objPatBox;
  return fromEntries;
})();
export { escapedByObjectPatternInit };
