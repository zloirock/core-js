import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a body-extracted param drops its polyfillable props from the pattern, and a trailing comma the
// source wrote leaves no empty slot behind them. the DYNAMIC computed key holds these on that path,
// and being retained it is also why the braces never empty: every reason the synth declines leaves
// a prop behind, so a fully emptied brace pair is not reachable at all
(function ({
  [_globalThis.pick]: z
}) {
  let o = _Array$of;
  return [o, z];
})(_globalThis.Array);
// two removed props in a row, ahead of the retained one
(function ({
  [_globalThis.pick]: z
}) {
  let e = _Object$entries;
  let k = _Object$keys;
  return [e, k, z];
})(_globalThis.Object);
// a block comment behind a removed prop survives, ahead of the retained one
(function ({
  /* keep me out */[_globalThis.pick]: z
}) {
  let v = _Object$values;
  return [v, z];
})(_globalThis.Object);