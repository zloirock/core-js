// A write through an object wrapper reaches the original container's constructor slot.
const escapedByWrapperLiteral = (function () {
  const wrappedBox = { k: Object };
  const wrapAround = { ref: wrappedBox };
  wrapAround.ref.k = Map;
  const { k: { create } } = wrappedBox;
  return create;
})();
export { escapedByWrapperLiteral };
