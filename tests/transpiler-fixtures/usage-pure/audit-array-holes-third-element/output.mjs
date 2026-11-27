import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Both skipped elements are arrays. Only the third slot supplies a string.
const [,, third] = [[1], [2], 'c'];
_atMaybeString(third).call(third, 0);

// The same pattern selects an array when only the third slot is an array.
const [,, last] = ['a', 'b', [3]];
_includesMaybeArray(last).call(last, 3);