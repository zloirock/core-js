import _globalThis from "@core-js/pure/actual/global-this";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
// A returned constructor escapes through its consumed call result and widens the family.
function hand(x) {
  _globalThis.taken = x;
}
const identity = x => x;
hand(identity(Number));
export const rounded = _Number$parseFloat('1.5');