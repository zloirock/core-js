// TS 4.7+ `infer T extends C` adds a constraint to the inferred slot. When the candidate
// element type is opaque (e.g. `unknown[]`), the inferred T falls back to the constraint
// instead of bailing - `Inner<unknown[]>` with `infer U extends string` resolves U to string.
// Distinct narrow methods (.at on the string-typed slot, .toFixed on a sibling number-typed
// slot) make both constraint resolutions observable: regression that drops the constraint
// would route `.at` through generic dispatch (es.array.at + es.string.at) and lose .toFixed.
type StrInner<T> = T extends Array<infer U extends string> ? U : never;
type NumInner<T> = T extends Array<infer U extends number> ? U : never;
declare const opaque: unknown[];
declare const s: StrInner<typeof opaque>;
declare const n: NumInner<typeof opaque>;
s.at(0);
n.toFixed(2);
