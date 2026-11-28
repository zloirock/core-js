import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A function that nobody calls does not expose the object it would return.
const held = {
  v: [5],
  other: 0
};
function unused() {
  return held;
}
void unused;
held.other = 1;
export const first = _atMaybeArray(_ref = held.v).call(_ref, 0);