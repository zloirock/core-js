import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// `Reg.get` is a LITERAL-discriminated overload set (`get('a'): string; get('b'): string; get('c'): string[]`).
// resolution matches each call's literal arg to the overload whose literal param equals it, so the receiver
// narrows PRECISELY per key - `get('a')`/`get('b')` to string, `get('c')` to string[] - NOT folded or
// first-arm'd (which would mis-narrow `get('c')` to the first overload's string). a method-resolution delta;
// babel and unplugin share the provider verdict, so no sidecar
interface Reg {
  get(k: 'a'): string;
  get(k: 'b'): string;
  get(k: 'c'): string[];
}
declare const reg: Reg;
_atMaybeString(_ref = reg.get('a')).call(_ref, 0);
_includesMaybeString(_ref2 = reg.get('b')).call(_ref2, 'z');
_findLastMaybeArray(_ref3 = reg.get('c')).call(_ref3, x => x);