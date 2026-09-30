import _Object$values from "@core-js/pure/actual/object/values";
// A write to another property accompanies a nested read of the unchanged constructor slot.
const unrelatedKeyWritten = function () {
  const holder = {
    k: Object,
    other: 1
  };
  holder.other = 2;
  const {
    k: {
      values
    }
  } = {
    k: {
      values: _Object$values
    }
  };
  return values;
}();
export { unrelatedKeyWritten };