// negative case: `let A = Array; A = other; new A(...)`. `A` has `constantViolations`;
// `resolveRuntimeExpression` walks to the last preceding assignment instead of the
// declaration init. `other` is an unbound Identifier but NOT a known constructor, so
// `resolveGlobalName` bails (the `resolveKnownConstructor(walkedName)` guard rejects
// non-canonical names) and behaves exactly as pre-fix: `arr` stays unclassified, so
// `arr.at(0)` falls through to the generic `_at` dispatcher rather than misleadingly
// claiming it's an Array. regression guard: reassignment must invalidate alias-walk.
let A = Array;
A = other;
const arr = new A(1, 2, 3);
arr.at(0);
