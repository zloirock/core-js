import _values from "@core-js/pure/actual/instance/values";
// An index read through a spread keeps the selected runtime element as its receiver.
const spreadSrc = [[9]];
const overSpread = function () {
  const values = _values([...spreadSrc][0]);
  return values;
}();
export { overSpread };