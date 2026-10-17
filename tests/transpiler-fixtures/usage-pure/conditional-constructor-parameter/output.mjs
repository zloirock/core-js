import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// The parameter reads a static from the constructor stored by a conditional pattern.
let P;
if (true) P = _Promise;
function f({
  try: t
} = {
  try: _Promise$try
}) {
  return typeof t;
}
export const result = f();