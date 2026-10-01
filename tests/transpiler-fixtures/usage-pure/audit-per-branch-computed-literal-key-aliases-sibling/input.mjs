// a static-literal computed key whose value aliases a sibling shorthand (`{ of, ['of']: x }`) must not
// overwrite the polyfilled shorthand: resolving the literal key polyfills BOTH slots, so the duplicate
// runtime key ('of') carries the polyfill on either binding instead of native `Array.of`. mirrors the
// Identifier-computed-key aliasing case, for a string-literal key
const cond = Math.random() > 0.5;
const { of, ['of']: x } = cond ? Array : Set;
[of, x];
