// A write to another property accompanies a nested read of the unchanged constructor slot.
const unrelatedKeyWritten = (function () {
  const holder = { k: Object, other: 1 };
  holder.other = 2;
  const { k: { values } } = holder;
  return values;
})();
export { unrelatedKeyWritten };
