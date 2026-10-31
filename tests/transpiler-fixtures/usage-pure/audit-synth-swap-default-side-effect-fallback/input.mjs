// destructure default with a side-effecting fallback expression. Receiver-rewrite on
// the outer `= Array` proceeds because the synthetic `{ from: _Array$from }` always
// provides a defined value for `from`, so the inner `= sideEffect()` never fires when
// the default applies. A user-supplied first argument may still skip the synthetic literal
function f({ from = sideEffect() } = Array) {
  return from([1]);
}
