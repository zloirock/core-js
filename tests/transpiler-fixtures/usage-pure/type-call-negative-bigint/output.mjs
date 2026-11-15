import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Signed bigint constraints retain the literal argument type.
declare function read<T extends bigint>(value: T): T extends -1n ? number[] : string;
_atMaybeArray(_ref = read(-1n)).call(_ref, -1);