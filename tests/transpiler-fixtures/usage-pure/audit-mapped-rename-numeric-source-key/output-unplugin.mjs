import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// expandMappedTypeMembers: source has numeric-keyed members. getKeyName returns
// "0", "1" as strings. The synth member { key: { type: 'Identifier', name: '0' } }
// is technically malformed (Identifier name must be valid identifier text) but
// only consumed internally by keyMatchesName. Verify resolution still works
type Tag<T> = { [K in keyof T as K]: T[K] };
declare const r: Tag<{ 0: number[]; 1: string[] }>;
_atMaybeArray(_ref = r[0]).call(_ref, 0);
_atMaybeArray(_ref2 = r[1]).call(_ref2, 0);