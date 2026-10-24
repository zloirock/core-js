// a `declare class` instance method (TSMethodSignature shape) must expose its return slot
// to `ReturnType<typeof x.method>`; folding the member to an empty function type lost it.
// `includes` distinguishes this array-narrowing from the property-signature twin's `.at(0)`.
declare class X { method(): number[] }
declare const x: X;
type R = ReturnType<typeof x.method>;
declare const r: R;
r.includes(0);
