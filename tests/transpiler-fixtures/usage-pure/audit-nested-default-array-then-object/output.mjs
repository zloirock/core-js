import _Array$from from "@core-js/pure/actual/array/from";
// nested function-param destructure: ObjectPattern -> ObjectProperty.value -> ArrayPattern
// -> AssignmentPattern (default = Array) -> ObjectPattern. synth-swap must walk this
// whole chain to recognise the destructure as a function-param shape
function f({
  a: [{
    from
  } = {
    from: _Array$from
  }]
} = {
  a: [undefined]
}) {
  return from([1]);
}
export { f };