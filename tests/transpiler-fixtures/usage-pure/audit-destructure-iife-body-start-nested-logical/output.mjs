import _Array$from from "@core-js/pure/actual/array/from";
// the IIFE arrow body is a nested logical whose leftmost operand is parenthesized in source
// (`(globalThis || x) || y`): the mirrored object at the deepest-left is protected by the source
// paren, so both emitters stay parseable. babel reprints (flattening the source paren and
// parenthesizing the object at the now-body-start); the unplugin text splice preserves the source
// paren and marks the leaf conservatively - a redundant but valid extra paren, hence the sidecar
function f({
  Array: {
    from
  }
} = (() => ({
  Array: {
    from: _Array$from
  }
}) || x || y)()) {
  return from;
}
f();