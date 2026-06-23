// indexed-access into a type-ALIAS method type: `Box<string>['take']` is the type of `take`, i.e.
// `() => string`. substituting the outer type-arg used to be DROPPED because the method signature
// reached the substitution dispatch directly - unlike an interface, whose members are folded via
// per-member iteration - so the return stayed the bare type-param and the call fell back to the
// generic helper. the substitution now reaches the signature, retaining the narrow on the call
// result. distinct methods on string vs number[] returns trace each line to its import.
type Box<T> = { take(): T; make(): T[] };

declare const takeString: Box<string>["take"];
export const a = takeString().at(0);

declare const makeNumbers: Box<number>["make"];
export const b = makeNumbers().includes(0);
