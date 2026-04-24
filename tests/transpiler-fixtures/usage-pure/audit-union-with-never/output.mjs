import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `string[] | never` - `never` is nullable/never -> foldUnionTypes skips; result = string[].
// tests that the never-skip works (shouldn't bail).
type Maybe = string[] | never;
declare const m: Maybe;
_atMaybeArray(m).call(m, 0);
_includesMaybeArray(m).call(m, 'x');