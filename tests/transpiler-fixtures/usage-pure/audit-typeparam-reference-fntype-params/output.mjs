import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// generic outer fn returning a function-type whose param references the outer type
// param T. without TSFunctionType params walk in reference-detection, outer-fn subst
// skips the inner signature even when T flows into a param-position type wrapper
function wrap<T>(x: T): (m: Map<T, string>) => string[] {
  return null as any;
}
const fn = wrap('a');
const result = fn(new _Map());
_atMaybeArray(result).call(result, 0);