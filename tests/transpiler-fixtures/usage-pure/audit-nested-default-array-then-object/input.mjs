// nested function-param destructure: ObjectPattern -> ObjectProperty.value -> ArrayPattern
// -> AssignmentPattern (default = Array) -> ObjectPattern. synth-swap must walk this
// whole chain to recognise the destructure as a function-param shape
function f({ a: [{ from } = Array] } = { a: [undefined] }) {
  return from([1]);
}
export { f };
