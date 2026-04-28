import _Array$from from "@core-js/pure/actual/array/from";
// destructure default with side-effecting fallback expression. synth-swap on the
// outer `= Array` proceeds because the synthetic `{ from: _Array$from }` always
// provides a defined value for `from`; the inner `= sideEffect()` never fires
// when default applies. user-supplied first argument may still skip the synth literal
function f({
  from = sideEffect()
} = {
  from: _Array$from
}) {
  return from([1]);
}