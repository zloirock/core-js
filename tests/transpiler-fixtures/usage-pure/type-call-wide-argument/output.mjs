import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// An explicit string annotation widens the argument before generic inference.
declare function read<T extends string>(value: T): T extends 'abc' ? number[] : string;
const value: string = 'abc';
_includesMaybeString(_ref = read(value)).call(_ref, 'bc');