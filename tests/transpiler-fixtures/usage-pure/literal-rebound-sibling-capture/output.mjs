import _at from "@core-js/pure/actual/instance/at";
// A module binding written by a function needs the same capture as a live import.
// Joining adjacent declarators must not drop its instance polyfill.
let rows = [];
export function rebind(value) {
  rows = value;
}
const before = note('before'),
  {
    y: _ref
  } = {
    y: rows
  },
  {
    0: {
      first
    } = {}
  } = _ref,
  at = _at(_ref);
use(first, at);