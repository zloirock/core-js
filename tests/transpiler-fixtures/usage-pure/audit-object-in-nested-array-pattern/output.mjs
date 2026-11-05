import _Array$from from "@core-js/pure/actual/array/from";
// A receiver default remains supported through two parameter-array levels.
// The from claim follows the supplied element or Array fallback at its original slot.
function f([[{
  from
} = {
  from: _Array$from
}]]) {
  return from([1]);
}
f([[Array]]);