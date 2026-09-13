import _Array$from from "@core-js/pure/actual/array/from";
// The array element's nested parameter pattern receives the statics from its known caller.
// Mirror the argument while preserving the function's pattern and optional call.
function f([{
  from
}]) {
  return from?.([1]);
}
f([{
  from: _Array$from
}]);