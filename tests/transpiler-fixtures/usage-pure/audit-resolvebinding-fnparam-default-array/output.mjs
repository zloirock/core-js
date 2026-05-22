import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Function param with an explicit annotation and a default value (`items: string[] = []`):
// the annotation narrows the binding to array. Distinct array-instance methods on each
// line, so each emitted polyfill maps to its source call.
function step(items: string[] = []) {
  _findLastMaybeArray(items).call(items, s => s);
  _atMaybeArray(items).call(items, 0);
  _includesMaybeArray(items).call(items, 'z');
}
step(['a', 'b']);