import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// indexed access T[number] on user alias that resolves to array/tuple.
// tests resolveElementType path through followTypeAliasChain.
type Items = string[];
declare const a: Items[number];
_atMaybeString(a).call(a, 0);
_includesMaybeString(a).call(a, 'x');