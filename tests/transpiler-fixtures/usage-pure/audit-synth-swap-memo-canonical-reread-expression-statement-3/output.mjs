import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// the buried leaf-key side effect survives the whole-swap, re-run ahead of the binding
let e = 0;
function leafKeySe({
  try: t,
  absent
} = (e++, {
  try: _Promise$try,
  absent: _Promise.absent
})) {
  return [t, absent];
}
leafKeySe();