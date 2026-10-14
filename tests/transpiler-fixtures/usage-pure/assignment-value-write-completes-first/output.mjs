import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// An assignment completes after the writes in its own value, so a later read takes the outer
// assignment's value although an inner write of the same binding is placed after its start - in a
// sequence statement and in a re-declaration alike.
let text = [1, 2];
text = (text = 'ab', [3]), 0;
export const last = _atMaybeArray(text).call(text, -1);
var list = 'cd';
var list = (list = [5], 'ef');
export const found = _includesMaybeString(list).call(list, 'e');