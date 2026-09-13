import _Array$from from "@core-js/pure/actual/array/from";
// The parameter consumes `from` from its supplied array element or its default.
// Both paths need the static method when the native Array.from is absent.
function f([{
  from
} = {
  from: _Array$from
}]) {
  return from([1, 2]);
}
f([{
  from: _Array$from
}]);