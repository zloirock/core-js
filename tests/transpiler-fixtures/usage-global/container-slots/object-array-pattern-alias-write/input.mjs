// An array pattern binds the contained object whose slot is subsequently replaced.
const escapedByArrayPatternInit = (function () {
  const patBox = { k: Object };
  const [reHomed] = [patBox];
  reHomed.k = Map;
  const { k: { getOwnPropertySymbols } } = patBox;
  return getOwnPropertySymbols;
})();
export { escapedByArrayPatternInit };
