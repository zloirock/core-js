import _Array$from from "@core-js/pure/actual/array/from";
// An array element in a parameter can be supplied or fall back to Array.
// Its supported selecting route serves from without changing when the default runs.
function f([{
  from
} = {
  from: _Array$from
}]) {
  return from([1, 2]);
}
f([Array]);