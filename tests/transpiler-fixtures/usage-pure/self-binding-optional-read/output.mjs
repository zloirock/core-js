import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A binding whose one value reads `?.` off the binding itself (`const value = value?.at`) is asked
// whether that value can be undefined, and the question comes back to the same binding. It stops
// with the answer for an opaque value: the source's guard stays. Declaration kinds, a single later
// write, a loop body and a mutual pair.
const value = value == null ? void 0 : _at(value);
let list = list == null ? void 0 : _includes(list);
var copy = copy == null ? void 0 : _flatMaybeArray(copy);
let held;
held = held == null ? void 0 : _fillMaybeArray(held);
held == null ? void 0 : _findMaybeArray(held).call(held, Boolean);
for (;;) {
  let item = item == null ? void 0 : _findLastMaybeArray(item);
  break;
}
const first = second == null ? void 0 : _mapMaybeArray(second),
  second = first == null ? void 0 : _filterMaybeArray(first);