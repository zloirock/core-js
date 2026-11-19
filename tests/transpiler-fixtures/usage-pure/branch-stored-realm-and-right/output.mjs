import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// A selected assignment yields its stored realm navigation to the constructor read: the Map claim
// injects, the gate the build serves folds away, and the write and navigation effect stay observable.
export function read(flag) {
  let held;
  let effects = 0;
  const Constructor = (held = (effects++, _self), _Map);
  return [Constructor, held, effects];
}