// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
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
  } = holder;
  return values;
}();
export { unrelatedKeyWritten };