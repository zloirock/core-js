// 2-level ObjectPattern nesting `{ a: { b: { from } = Array } }`. helper walks
// ObjectProperty (a) -> ObjectPattern (mid) -> ObjectProperty (b) -> AssignmentPattern
// -> ObjectPattern (inner) chain. exercises ObjectProperty.value + ObjectPattern
// transparent-wrapper passthrough at depth > 1
function f({ a: { b: { from } = Array } } = { a: { b: undefined } }) {
  return from([1]);
}
export { f };
