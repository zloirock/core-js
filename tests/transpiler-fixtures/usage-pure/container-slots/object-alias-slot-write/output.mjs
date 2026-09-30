import _Map from "@core-js/pure/actual/map/constructor";
// A write through a definite alias replaces the original container's constructor slot.
const escapedByAlias = function () {
  const aliasedBox = {
    k: Object
  };
  const aliasName = aliasedBox;
  aliasName.k = _Map;
  const {
    k: {
      getPrototypeOf
    }
  } = aliasedBox;
  return getPrototypeOf;
}();
export { escapedByAlias };