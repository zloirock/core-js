import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// The retained array contains strings; skipping Extract also admits an array element.
type Narrowed = Extract<string[][] | string[], string[]>;
declare const arr: Narrowed;
export const first = _atMaybeString(_ref = arr[0]).call(_ref, 0);
export const has = _includesMaybeArray(arr).call(arr, 'a');