import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
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
const first = second?.map,
  second = first?.filter;