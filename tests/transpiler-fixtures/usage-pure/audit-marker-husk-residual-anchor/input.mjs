// A dead chain wrapper and its plain twin expose the same realm. Neither reshapes an
// unclaimed constructor hop; a property name shared with an instance method is not a claim.
let fromMarked, fromPlain, named;
// Unknown leaves retain their nested source pattern.
({ Array: { unknownKey: fromMarked } } = globalThis?.globalThis);
({ Array: { unknownKey: fromPlain } } = globalThis.globalThis);
// A name match on a different receiver also stays native.
({ Array: { keys: named } } = globalThis?.globalThis);
// A declaration host makes the same choice.
const { Array: { unknownDecl } } = globalThis?.globalThis;
export { fromMarked, fromPlain, named, unknownDecl };
