// TS 4.7+ `infer T extends C` adds a constraint to the inferred slot. when the candidate
// element type is opaque (e.g. `unknown[]`), the inferred T must fall back to the constraint
// instead of bailing - `infer U extends string` resolves U to string. distinct narrow
// methods (.at on the string slot, .toFixed on a sibling number slot) make both resolutions
// observable: dropping the constraint routes `.at` through generic dispatch and loses .toFixed.
type StrInner<T> = T extends Array<infer U extends string> ? U : never;
type NumInner<T> = T extends Array<infer U extends number> ? U : never;
declare const opaque: unknown[];
declare const s: StrInner<typeof opaque>;
declare const n: NumInner<typeof opaque>;
// @ts-expect-error the resolver binds the constraint where tsc infers nothing, and the false branch is never, so no value can disagree
s.at(0);
// @ts-expect-error the resolver binds the constraint where tsc infers nothing, and the false branch is never, so no value can disagree
n.toFixed(2);
