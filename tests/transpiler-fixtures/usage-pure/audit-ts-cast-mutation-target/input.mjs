// a mutation target behind stacked wrappers (TS cast, doubled parens) still records: the
// classification peels DOWNWARD from the mutation host, so wrapper depth is unbounded
delete (Map.groupBy as any);
export const r1 = Map.groupBy(x, f);
((Iterator.from)) ||= shim;
export const r2 = Iterator.from(it);
Object.defineProperty((Map as any), 'groupBy', { value: dpPatch });
export const r3 = Map.groupBy(y, g);
// an ENUM-member computed key names its member like every other spelling of that key: detection
// asks the TYPE layer's key-name resolver, which owns the enum fold (shadowing gate, merged blocks),
// instead of keeping a boundary the other spellings did not have - a literal, a template and a
// const-bound identifier chain all claimed here while the enum member alone stayed raw
enum HopKeys { MAP = 'map' }
export const r4 = arr.flat?.()[HopKeys.MAP](f)?.at(0);
// ... and the NEGATIVES of that arm, so a later widening cannot swallow them: a member the enum
// does not declare, a plain object property that merely looks like one, an object literal keyed the
// same way, and a dynamic key all name nothing and leave the read raw
declare const dynKey: string;
const plainObj = { MAP: 'map' };
export const r5 = arr.flat?.()[HopKeys.MISSING](f);
export const r6 = arr.flat?.()[plainObj.MAP](f);
export const r7 = arr.flat?.()[dynKey](f);
// ... and the enum whose SLOT the program rewrites: the declared value is no longer the runtime key,
// so the claim stands down whichever channel does the rewriting - a member write, or a call handed
// the container itself (the write index is keyed by assigned field and cannot see the second)
enum Patched { MAP = 'map' }
(Patched as any).MAP = 'filter';
enum Assigned { MAP = 'map' }
Object.assign(Assigned, { MAP: 'filter' });
export const r8 = arr.flat?.()[Patched.MAP](f);
export const r9 = arr.flat?.()[Assigned.MAP](f);
// ... including the patch that travels through an ALIAS of the container, which the escape census
// follows and a per-name walk of the calls alone would miss
enum Aliased { MAP = 'map' }
const aliasOfEnum = Aliased;
Object.assign(aliasOfEnum, { MAP: 'filter' });
export const r10 = arr.flat?.()[Aliased.MAP](f);
