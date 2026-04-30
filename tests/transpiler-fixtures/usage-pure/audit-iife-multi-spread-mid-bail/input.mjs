// IIFE call with mid-stream spread containing nested SpreadElement: `(...[a, ...rest])`.
// `detectIifeArgPath` bails per `nested SpreadElement` invariant - paramIndex would be
// off by N when `rest` expands. No synth-swap, no body-extract: caller-arg unknown
const arr = [Array];
const rest = [Object];
(({ from }, { keys }) => [from, keys])(...[arr[0], ...rest]);
