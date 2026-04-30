import _Array$from from "@core-js/pure/actual/array/from";
// ObjectProperty.value -> ArrayPattern -> AssignmentPattern -> ObjectPattern chain.
// `isFunctionParamDestructureParent` must walk through ObjectProperty.value (added in
// p17a09-01 fix), then through ArrayPattern (existing) to reach the function param
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