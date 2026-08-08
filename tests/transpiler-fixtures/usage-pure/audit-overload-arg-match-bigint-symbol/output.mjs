import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3;
// bigint and symbol are typeof-primitives too - an arg of those kinds must select its OWN overload, not
// fold to the declaration-first one. `m(123n)` (bigint) and `m(sym)` (symbol) pick the string[] overloads
// (Array.at / Array.includes), while the number arg keeps string (String.at). arg-match covers the full
// typeof-primitive set (string/number/boolean/bigint/symbol), not just string/number/boolean
interface P {
  m(x: number): string;
  m(x: bigint): string[];
  m(x: symbol): string[];
}
declare const p: P;
declare const sym: symbol;
_atMaybeArray(_ref = p.m(123n)).call(_ref, 0);
_atMaybeString(_ref2 = p.m(7)).call(_ref2, 0);
_includesMaybeArray(_ref3 = p.m(sym)).call(_ref3, 'z');