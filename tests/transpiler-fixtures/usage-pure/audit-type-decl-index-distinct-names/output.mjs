import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// type-alias declarations resolve through a per-statement-list name -> decl index (built once,
// O(1) lookups - avoids the O(N^2) per-name statement walk). each distinct alias name must map to
// its OWN declaration, not collapse to a shared one: distinct element types + methods prove the
// index keys names independently.
type Arr = number[];
type Str = string;
function useArr(a: Arr) {
  return _atMaybeArray(a).call(a, 0);
}
function useStr(s: Str) {
  return _atMaybeString(s).call(s, 0);
}
function useArr2(b: Arr) {
  return _includesMaybeArray(b).call(b, 1);
}