import _Array$of from "@core-js/pure/actual/array/of";
// A loop writing a local member does not hand its constructor to an outside reader.
// Only the static read after the loop needs coverage.
function use() {
  var _ref;
  const box = {};
  for (box.value of [Array]) {}
  _ref = box.value, _ref === Array ? _Array$of(3) : _ref.of(3);
}
use();