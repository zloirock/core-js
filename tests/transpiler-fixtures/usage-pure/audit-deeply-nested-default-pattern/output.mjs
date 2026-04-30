import _Array$from from "@core-js/pure/actual/array/from";
// Nested destructure with default at inner pattern: `({a: {b} = Array} = ...)`.
// The inner AssignmentPattern is on `value` slot of an `ObjectProperty`, not on the
// outer-pattern shape. Verify how synth-swap reaches the inner default
function f({
  a: {
    from
  } = {
    from: _Array$from
  }
} = {
  a: undefined
}) {
  return from([1]);
}
export { f };