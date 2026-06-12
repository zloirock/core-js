// a mutation target behind stacked wrappers (TS cast, doubled parens) still records: the
// classification peels DOWNWARD from the mutation host, so wrapper depth is unbounded
delete (Map.groupBy as any);
export const r1 = Map.groupBy(x, f);
((Iterator.from)) ||= shim;
export const r2 = Iterator.from(it);
Object.defineProperty((Map as any), 'groupBy', { value: dpPatch });
export const r3 = Map.groupBy(y, g);
// an ENUM-member computed key stays unresolved - the detection canon resolves literals,
// templates and const-bound identifier chains, not type-layer enums (consistent boundary)
enum HopKeys { MAP = 'map' }
export const r4 = arr.flat?.()[HopKeys.MAP](f)?.at(0);
