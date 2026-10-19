import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// a class instantiated with a type argument the resolver CAN type keeps the precision of its
// type-param-returning method - the declared return answers, not the body's stub - and an omitted
// argument falls back to the parameter's default
class Holder<T = string> {
  get(): T {
    return null as any;
  }
}
declare const resolved: Holder<number[]>;
_atMaybeArray(_ref = resolved.get()).call(_ref, 0);
declare const defaulted: Holder;
_includesMaybeString(_ref2 = defaulted.get()).call(_ref2, 'd');