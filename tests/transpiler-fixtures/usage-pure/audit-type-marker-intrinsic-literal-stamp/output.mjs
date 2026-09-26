import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// the intrinsic string transformers are computable on a literal argument and TS keeps the
// result a LITERAL type, so a conditional that discriminates on it takes the TRUE branch.
// a dropped stamp reads as wide-vs-narrow and answers with the other family entirely
type Upper = Uppercase<'a'> extends 'A' ? number[] : string;
type Lower = Lowercase<'A'> extends 'zz' ? number[] : string;
declare const upper: Upper;
declare const lower: Lower;
_atMaybeArray(upper).call(upper, 0);
_includesMaybeString(lower).call(lower, 'a');