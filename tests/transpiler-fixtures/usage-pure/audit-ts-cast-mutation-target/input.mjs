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
// the same key spelling inside a PATTERN: a destructure names its slot through the same resolver a
// member read does, so an enum-member key extracts exactly as its literal twin - and the patched
// enum declines there too
enum PatKeys { OF = 'of' }
enum PatPatched { OF = 'of' }
Object.assign(PatPatched, { OF: 'from' });
const { [PatKeys.OF]: fromEnumKey } = Array;
const { [PatPatched.OF]: fromPatchedKey } = Array;
export const r11 = typeof fromEnumKey;
export const r12 = typeof fromPatchedKey;
// a WRITE whose key is spelled through an enum member names the slot it patches, exactly as the
// four other spellings do: the patched member stops being substitutable while its NEIGHBOUR keeps
// its claim. spelled as an unreadable key the census deopted the whole receiver, and the neighbour
// lost its polyfill with it
enum WriteKeys { OF = 'of' }
Array[WriteKeys.OF] = function () { return [9]; };
export const r13 = Array.of(1);
export const r14 = Array.from([2]);
// a REALM HOP whose key an enum member spells names the hop like every other spelling of that key,
// so the claim above it fires: the run folds away and the static is substituted. named by the
// structural fold alone the hop stayed unknown, the claim was lost, and the run kept a raw read
enum HopName { SELF = 'self' }
export const r15 = globalThis[HopName.SELF].Array.from([3]);
export const r16 = globalThis[HopName.SELF].Map;
// ... and the patched twin declines, exactly as it does on a member key
enum HopPatched { SELF = 'self' }
Object.assign(HopPatched, { SELF: 'window' });
export const r17 = globalThis[HopPatched.SELF].Array.from([4]);
// a `delete` over the same enum-spelled hop lands the operator's ROOT binding, as it does for every
// other spelling of that key - the fold's own rule, not the run's landing
export const r18 = delete globalThis[HopName.SELF].customQ;
// ... and the same hop as a DESTRUCTURE init: the pattern extracts through the resolved receiver
// exactly as the literal spelling does, and the patched twin keeps the raw read
const { from: fromHop } = globalThis[HopName.SELF].Array;
const { from: fromPatchedHop } = globalThis[HopPatched.SELF].Array;
export const r19 = typeof fromHop;
export const r20 = typeof fromPatchedHop;
// ... and the INSTANCE split over the same hop: its receiver collapses like the static one, so the
// dispatch reads the ponyfill instead of a realm slot the host may not have
export const r21 = globalThis[HopName.SELF].Array.prototype.at.call([7, 8], -1);
