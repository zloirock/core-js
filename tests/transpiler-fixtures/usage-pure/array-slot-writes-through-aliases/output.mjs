import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// A source write changes the shared slot from Array to String after the captured method.
// Distinct methods expose Array.at before the write and String.includes after it.
const rows = [[0, 2]];
const alias = rows;
const before = _atMaybeArray(alias[0]);
rows[0] = '02';
use(before, _includesMaybeString(_ref = alias[0]).call(_ref, '2'));