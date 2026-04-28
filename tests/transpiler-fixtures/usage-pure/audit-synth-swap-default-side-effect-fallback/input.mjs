// destructure default with side-effecting fallback expression. synth-swap on the
// outer `= Array` proceeds because the synthetic `{ from: _Array$from }` always
// provides a defined value for `from`; the inner `= sideEffect()` never fires
// when default applies. user-supplied first argument may still skip the synth literal
function f({ from = sideEffect() } = Array) {
  return from([1]);
}
