// A write through a definite alias replaces the original container's constructor slot.
const escapedByAlias = (function () {
  const aliasedBox = { k: Object };
  const aliasName = aliasedBox;
  aliasName.k = Map;
  const { k: { getPrototypeOf } } = aliasedBox;
  return getPrototypeOf;
})();
export { escapedByAlias };
