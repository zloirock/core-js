import _Array$from from "@core-js/pure/actual/array/from";
// Closed callers prove the native constructor through the supplied value.
// Only the selected static is required.
function get() {
  return Array;
}
function read(held) {
  return _Array$from([1]);
}
read(get());