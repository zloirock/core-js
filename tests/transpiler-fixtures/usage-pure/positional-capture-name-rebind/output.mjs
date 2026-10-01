import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Replacing a source name leaves its previously captured array or string intact.
let array = [1];
const [savedArray] = [array];
array = '02';
_atMaybeArray(savedArray);
let string = '02';
const [savedString] = [string];
string = [1];
_includesMaybeString(savedString);