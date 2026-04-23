// `type Dict<V> = { [k: string]: V }` + `Dict<number[]>[string]` - getTypeMembers crosses
// the alias boundary without substituting V with `number[]`. the index signature's
// annotation then reads V (a type-param ref) instead of the instantiated inner, falling
// through to generic `_at`. fix: apply buildSubstMap over returned members after alias recurse
type Dict<V> = { [k: string]: V };
declare const d: Dict<number[]>;
d["foo"].at(-1);
