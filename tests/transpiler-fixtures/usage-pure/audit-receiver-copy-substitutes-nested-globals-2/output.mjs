import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// receiver-copy global substitution across the remaining SE-free shapes: a binary operand, a computed
// member access (the computed-key global), and a computed property's VALUE - each global must substitute
// in the copied receiver exactly as babel's re-traversed clone does. distinct instance methods per line.
const obj = {};
const a = _atMaybeArray([_Set.length + 1]);
const b = _includesMaybeArray([obj[_Map]]);
const c = _flatMaybeArray([{
  ["k"]: _WeakSet
}]);
export const r = [a, b, c];