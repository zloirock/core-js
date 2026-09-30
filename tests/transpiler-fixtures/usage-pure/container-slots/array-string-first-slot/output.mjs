import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A canonical string index selects the same array element as its numeric spelling.
const stringSpelling = function () {
  const flat = _flatMaybeArray([3, [4]]);
  return flat;
}();
export { stringSpelling };