import _Array$from from "@core-js/pure/actual/array/from";
// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order.
function f([[{
  from
} = {
  from: _Array$from
}]]) {
  return from([1]);
}
f([[Array]]);