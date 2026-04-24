import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// indexed access `Items[number]` on a user alias that expands to `string[]` must
// yield element type `string`, so both `.at` and `.includes` dispatch to the
// string-specific polyfills
type Items = string[];
declare const a: Items[number];
_atMaybeString(a).call(a, 0);
_includesMaybeString(a).call(a, 'x');