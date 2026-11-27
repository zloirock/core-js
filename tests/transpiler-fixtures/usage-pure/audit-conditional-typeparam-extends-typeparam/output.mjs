import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// The type argument on the right is concrete at the call site.
type Cond<T, U> = T extends U ? string : number[];
declare function probe<T, U>(): Cond<T, U>;
_atMaybeArray(_ref = probe<Array<number>, Array<string>>()).call(_ref, 0);
_includesMaybeString(_ref2 = probe<Array<string>, Array<string>>()).call(_ref2, 'x');
export {};