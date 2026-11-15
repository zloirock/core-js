import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A literal-typed optional parameter specializes its signature even when omitted.
declare function read(value: string): string;
declare function read(value: string, mode?: 'rows'): number[];
_atMaybeArray(_ref = read('value')).call(_ref, -1);