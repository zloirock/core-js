// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
function invoke(callback) {
  return callback();
}
export const result = invoke(() => {
  let first = {
    x: Number
  };
  let second = {
    x: Array
  };
  first = second;
  second = first;
  const {
    x: {
      from
    }
  } = first;
  return from({
    0: 'callback',
    length: 1
  });
});