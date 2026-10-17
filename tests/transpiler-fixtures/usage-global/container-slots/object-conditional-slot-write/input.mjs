// The closed truthy caller makes the slot write replace Object with Map before the read.
const conditionalSlotWrite = (function (flag) {
  const maybe = { k: Object };
  if (flag) maybe.k = Map;
  const { k: { entries } } = maybe;
  return entries;
})(1);
export { conditionalSlotWrite };
