import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `string[] | never` collapses to `string[]`; the never-branch must not bail
// out the array detection so array-specific polyfills are still selected.
type Maybe = string[] | never;
declare const m: Maybe;
_atMaybeArray(m).call(m, 0);
_includesMaybeArray(m).call(m, 'x');