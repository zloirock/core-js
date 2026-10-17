// A binding whose one value reads `?.` off the binding itself (`const value = value?.at`) holds no
// value the analysis can see, so each method is injected for every receiver family it could name and
// the source stays as written. Declaration kinds, a single later write, a loop body and a mutual pair.
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
