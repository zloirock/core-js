// expandMappedTypeMembers: source has numeric-keyed members. getKeyName returns
// "0", "1" as strings. The synth member { key: { type: 'Identifier', name: '0' } }
// is technically malformed (Identifier name must be valid identifier text) but
// only consumed internally by keyMatchesName. Verify resolution still works
type Tag<T> = { [K in keyof T as K]: T[K] };
declare const r: Tag<{ 0: number[]; 1: string[] }>;
r[0].at(0);
r[1].at(0);
