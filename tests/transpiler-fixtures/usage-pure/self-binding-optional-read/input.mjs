// A binding whose one value reads `?.` off the binding itself (`const value = value?.at`) is asked
// whether that value can be undefined, and the question comes back to the same binding. It stops
// with the answer for an opaque value: the source's guard stays. Declaration kinds, a single later
// write, a loop body and a mutual pair.
const value = value?.at;
let list = list?.includes;
var copy = copy?.flat;
let held;
held = held?.fill;
held?.find(Boolean);
for (;;) {
  let item = item?.findLast;
  break;
}
const first = second?.map, second = first?.filter;
