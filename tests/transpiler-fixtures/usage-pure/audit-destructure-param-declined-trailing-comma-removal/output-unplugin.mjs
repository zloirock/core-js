import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a body-extracted param drops its polyfillable prop by text splice; the removal must consume the
// comma that goes with it, or the pattern is left as `{ , }` - a syntax error the AST-based twin
// never emits. the DYNAMIC computed key holds these on that path, and being retained it is also why
// the braces never empty: every reason the synth declines leaves a prop behind, so a fully emptied
// brace pair is not reachable at all
(function ({ [_globalThis.pick]: z, }) {
  let o = _Array$of;
  return [o, z];
})(_globalThis.Array);
// two removed props in a row: the comma consumed for the first must not overlap the range the
// second takes, and the comma before the retained tail has to go with it
(function ({ [_globalThis.pick]: z, }) {
  let e = _Object$entries;
  let k = _Object$keys;
  return [e, k, z];
})(_globalThis.Object);
// a block comment between a removed prop and its comma must not hide the comma from the removal
// scan, or the same orphaned-comma syntax error returns
(function ({ [_globalThis.pick]: z, }) {
  let v = _Object$values;
  return [v, z];
})(_globalThis.Object);