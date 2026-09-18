// A loop writing a local member does not hand its constructor to an outside reader.
// Only the static read after the loop needs coverage.
function use() {
  const box = {};
  for (box.value of [Array]) {}
  box.value.of(3);
}
use();
