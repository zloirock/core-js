import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// re-read-observability boundary across the remaining shapes: a member read under a binary operand
// (`Set.length + 1`) and a computed member access (`obj[Map]`) make the literal single-read-only -
// a SOLE binding still extracts it once (eliminate-residual), never as a second copy. a computed
// property's VALUE (`WeakSet`, identifier-only) stays freely copyable and substitutes like babel's
// re-traversed clone. distinct instance methods per line.
const obj = {};
const a = _atMaybeArray([_Set.length + 1]);
const b = _includesMaybeArray([obj[_Map]]);
const c = _flatMaybeArray([{
  ["k"]: _WeakSet
}]); // an accessor DEFINITION is single-read-only the same way (a copy would re-fire on reads)
const d = _keysMaybeArray([{
  get g() {
    return _Map;
  }
}]); // a member read inside a FUNCTION body is deferred, not re-evaluated at literal creation -
// the literal stays freely copyable
const e = _valuesMaybeArray([() => _Set.prototype]);
export const r = [a, b, c, d, e];