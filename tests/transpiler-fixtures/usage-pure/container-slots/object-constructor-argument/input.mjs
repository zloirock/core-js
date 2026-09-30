// A new-expression argument hands the container to a constructor that writes its slot.
const escapedByNew = (function () {
  function TakerShape(target) { if (target) target.k = Map; }
  const newBox = { k: Object };
  void new TakerShape(newBox);
  const { k: { entries } } = newBox;
  return entries;
})();
export { escapedByNew };
