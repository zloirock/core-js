// `function({ from } = X)` - object destructure with a default at param position.
// A per-key destructure default `{from = _P} = X` can't protect against a buggy native
// `X.from` that exists but misbehaves: the default only fires on `X.from === undefined`.
// The receiver gets swapped instead - every destructured key becomes an explicit entry
// in a synthetic object so `f()` binds to the polyfill regardless of native presence.
// Caller-passed args bypass the default entirely
function f({ from } = Array) {
  return from;
}
f;
