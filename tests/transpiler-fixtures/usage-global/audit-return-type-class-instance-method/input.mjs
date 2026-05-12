// Class-body instance method through TSMethodSignature-shaped declaration (`declare
// class`) must expose its return slot to `ReturnType<typeof x.method>`. `findTypeMember`
// used to fold the member to a synthetic empty function type, so the return type was lost.
// Using `includes` distinguishes this fixture's array-narrowing from the TSMethodSignature
// property fixture which uses `.at(0)`.
declare class X { method(): number[] }
declare const x: X;
type R = ReturnType<typeof x.method>;
declare const r: R;
r.includes(0);
