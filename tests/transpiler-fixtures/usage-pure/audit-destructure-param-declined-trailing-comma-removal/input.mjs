// a body-extracted param drops its polyfillable prop by text splice; the removal must consume the
// comma that goes with it, or the pattern is left as `{ , }` - a syntax error the AST-based twin
// never emits. the DYNAMIC computed key holds these on that path, and being retained it is also why
// the braces never empty: every reason the synth declines leaves a prop behind, so a fully emptied
// brace pair is not reachable at all
(function ({ 'of': o, [globalThis.pick]: z, }) {
  return [o, z];
})(globalThis.Array);
// two removed props in a row: the comma consumed for the first must not overlap the range the
// second takes, and the comma before the retained tail has to go with it
(function ({ 'entries': e, 'keys': k, [globalThis.pick]: z, }) {
  return [e, k, z];
})(globalThis.Object);
// a block comment between a removed prop and its comma must not hide the comma from the removal
// scan, or the same orphaned-comma syntax error returns
(function ({ 'values': v /* keep me out */, [globalThis.pick]: z, }) {
  return [v, z];
})(globalThis.Object);
