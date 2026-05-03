import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// evalRenameTemplate handles `string & K` intersection (drops the string-keyword
// half, evaluates the rest). Verify that with a real source where K is the type
// param: members preserve their names through the intersection rename.
type Brand<T> = { [K in keyof T as string & K]: T[K] };
declare const r: Brand<{ items: number[]; name: string }>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_includesMaybeString(_ref2 = _nameMaybeFunction(r)).call(_ref2, 'a');