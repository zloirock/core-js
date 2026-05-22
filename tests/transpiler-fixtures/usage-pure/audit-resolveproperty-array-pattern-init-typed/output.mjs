import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Array-destructure `const [first, mid, last] = tup` from a typed tuple
// `[string, string[], string]`: each binding picks up its slot type, so `.includes` on
// the string slots emits the string polyfill and `.findLast` on the array slot emits
// the array polyfill.
declare const tup: [string, string[], string];
const [first, mid, last] = tup;
_includesMaybeString(first).call(first, 'a');
_findLastMaybeArray(mid).call(mid, x => x);
_atMaybeString(last).call(last, 0);