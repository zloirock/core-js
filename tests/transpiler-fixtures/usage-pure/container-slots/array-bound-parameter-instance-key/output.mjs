import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A const-bound computed key selects an instance method from an array parameter default.
const constBoundComputedInstanceKey = function () {
  const KEY = 'flat';
  return function ({
    [KEY]: f
  } = {
    [KEY]: _flatMaybeArray([3, [4]])
  }) {
    return f;
  }();
}();
export { constBoundComputedInstanceKey };