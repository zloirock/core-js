// `function({ from } = X)` - ObjectPattern wrapped in AssignmentPattern at param position.
// inline-default `{from = _P} = X` can't protect against buggy-present native `X.from`:
// the default only fires on `X.from === undefined`. swap the receiver instead - every
// destructured key becomes an explicit entry in a synth object so `f()` binds to the
// polyfill regardless of native presence. caller-passed args bypass the default entirely
function f({ from } = Array) {
  return from;
}
f;
