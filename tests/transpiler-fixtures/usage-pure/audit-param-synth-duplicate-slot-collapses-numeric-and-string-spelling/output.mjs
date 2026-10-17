import _Object$entries from "@core-js/pure/actual/object/entries";
// the numeric and string spellings of one slot collapse together too
const numericAndStringSpelling = function ({
  0: a,
  '0': b,
  entries
} = {
  "0": Object["0"],
  entries: _Object$entries
}) {
  return [a, b, entries];
}();
export { numericAndStringSpelling };