// the branching container value is read through the CANONICAL peel and answered by the canonical
// branch enumeration, so the indirections the bare-alias axis already sees through are seen through
// here too: a wrapped branching value, an arm that aliases another one, and arms whose walks pass
// the same hop name. each line picks a static only one arm carries; distinct method per line.
const c = Math.random() > 0.5;

// a sequence wrapper does not hide the branching value
const wrapped = { Base: (0, c ? Object : Array) };
export const viaSequence = wrapped.Base.fromAsync([]);

// neither does a zero-arg factory call
const factory = { Base: (() => c ? Object : Promise)() };
export const viaFactory = factory.Base.withResolvers();

// an ARM that aliases another branching value reaches that one's arms too
const innerBranch = c ? Object : Map;
const aliasedArm = { Base: c ? innerBranch : Boolean };
export const viaAliasedArm = aliasedArm.Base.groupBy([], x => x);

// arms whose container walks pass the SAME hop name each get their own answer
const hop = { left: String, right: Reflect };
const shared = c ? { Base: hop.left } : { Base: hop.right };
export const viaSharedHop = shared.Base.raw`x` + shared.Base.ownKeys({});

// NEGATIVE: an array slot holding a NAV is no branching value - the walk still declines it, so the
// key brings in no static of its own and only the realm the nav names is injected
const navSlot = [globalThis.Array];
export const viaNavSlot = navSlot[0].of(1);
