// member-on-indexed-access through `Parameters<typeof fn>[0]`. `findTypeMember` falls
// through `resolveIndexedAccessMembers` because Parameters isn't in STRUCTURE_PRESERVING_WRAPPERS
// and `getTypeMembers` returns null for the special built-in. without the numeric-key
// fallback to `findTupleElement` (which resolves Parameters via `resolveParametersParams`),
// the inner member access fails and `.at(0)` falls to generic `_at`. parity with
// `resolveIndexedAccessType`'s numeric branch
function fn(x: { foo: string[] }) {}
declare const obj: Parameters<typeof fn>[0];
obj.foo.at(0);
