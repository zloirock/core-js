// a body-extracted param drops its polyfillable props from the pattern, and a trailing comma the
// source wrote leaves no empty slot behind them. the DYNAMIC computed key holds these on that path,
// and being retained it is also why the braces never empty: every reason the synth declines leaves
// a prop behind, so a fully emptied brace pair is not reachable at all
(function ({ 'of': o, [globalThis.pick]: z, }) {
  return [o, z];
})(globalThis.Array);
// two removed props in a row, ahead of the retained one
(function ({ 'entries': e, 'keys': k, [globalThis.pick]: z, }) {
  return [e, k, z];
})(globalThis.Object);
// a block comment behind a removed prop survives, ahead of the retained one
(function ({ 'values': v /* keep me out */, [globalThis.pick]: z, }) {
  return [v, z];
})(globalThis.Object);
