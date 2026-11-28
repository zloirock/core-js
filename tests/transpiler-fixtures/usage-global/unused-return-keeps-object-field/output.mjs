import "core-js/modules/es.array.at";
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
export const first = held.v.at(0);