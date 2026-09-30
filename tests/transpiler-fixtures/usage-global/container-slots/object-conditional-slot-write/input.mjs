// A conditional slot write leaves both runtime constructor candidates possible at the read.
const conditionalSlotWrite = (function (flag) {
  const maybe = { k: Object };
  if (flag) maybe.k = Map;
  const { k: { entries } } = maybe;
  return entries;
})(1);
export { conditionalSlotWrite };
