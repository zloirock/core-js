// A bare const-alias root with an optional connector and NO proxy hop keeps the `?.`: babel does
// not normalize user-alias optional chains (only injected-import roots), so `g?.Array` stays
// `g?.Array` for parity. (A collapsed hop, e.g. `g?.self?.Array`, DOES normalize - the member is
// rebuilt - but a bare `g?.Array` does not.)
const g = globalThis;
const { from, ...rest } = g?.Array;
from([1]);
