import _Array$from from "@core-js/pure/actual/array/from";
// A nested sequence member evaluates its effect before any binding. Its captured
// value keeps the extracted first property ahead of the following native length read.
var box = {
  y: Array
};
var _ref = (0, b(), box).y,
  from = _Array$from,
  {
    length
  } = _ref;
export { from, length };