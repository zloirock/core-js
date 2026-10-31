import _Array$from from "@core-js/pure/actual/array/from";
// 2-level ObjectPattern nesting `{ a: { b: { from } = Array } }`. helper walks
// ObjectProperty (a) -> ObjectPattern (mid) -> ObjectProperty (b) -> AssignmentPattern
// -> ObjectPattern (inner) chain. exercises ObjectProperty.value + ObjectPattern
// transparent-wrapper passthrough at depth > 1
function f({
  a: {
    b: {
      from
    } = {
      from: _Array$from
    }
  }
} = {
  a: {
    b: undefined
  }
}) {
  return from([1]);
}
export { f };