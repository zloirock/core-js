// A quiet call yielding the realm is a root for an enum-spelled hop too.
// Delete lands on that root, as in the dotted form.
enum RealmHop { SELF = 'self' }
// @ts-expect-error the realm field stands for an arbitrary user property
export const removed = delete (() => globalThis)()[RealmHop.SELF].marker;
