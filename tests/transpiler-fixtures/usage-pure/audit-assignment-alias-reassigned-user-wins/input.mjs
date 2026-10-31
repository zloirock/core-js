// an assignment-form ctor alias with a LATER user reassignment: the write is not the binding's
// single trusted source, so the registration is refused and the member read gets the runtime
// ctor guard - at runtime the user's value fails the ctor comparison and the raw branch reads
// the user's own member (last-write-wins, exactly like untranspiled code)
let M;
({ Map: M } = globalThis);
M = { groupBy: () => 'U' };
export const r = M.groupBy([1], x => x);
