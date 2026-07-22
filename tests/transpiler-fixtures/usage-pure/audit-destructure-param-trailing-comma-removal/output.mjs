import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a body-extracted param drops its polyfillable prop by text splice; the removal must consume a
// trailing comma too, or the pattern is left as `{ , }` - a syntax error the AST-based twin never
// emits. the sole-prop and fully-consumed-tail shapes are the ones that empty the braces
(function ({}) {
  let f = _Array$from;
  return f;
})(_globalThis.Array);
(function ({}) {
  let f = _Array$from;
  let o = _Array$of;
  return [f, o];
})(_globalThis.Array);
// a block comment between the sole prop and its trailing comma must not hide the comma from the
// removal scan, or the same orphaned-comma syntax error returns
(function ({}) {
  let o = _Array$of;
  return o;
})(_globalThis.Array);