import _Array$from from "@core-js/pure/actual/array/from";
// destructure-default through doubly-nested array-pattern - param position is still
// recognised once the wrapper layers are peeled
function f([[{
  from
} = {
  from: _Array$from
}]]) {
  return from([1]);
}
f([[Array]]);