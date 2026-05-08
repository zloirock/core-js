import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `Extract<T, string>` with `T = string | number` must distribute over the union and pick `string`.
// Without distribution, the unresolvable union forces generic polyfills instead of String-specific ones.
function pick<T>(v: Extract<T, string>): typeof v {
  return v;
}
const r = pick<string | number>('a');
_atMaybeString(r).call(r, 0);
_includesMaybeString(r).call(r, 'x');