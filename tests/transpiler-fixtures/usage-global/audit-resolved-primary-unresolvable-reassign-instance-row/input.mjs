// a resolved declarator describes the receiver only BEFORE a reassignment: `let O = Object` with a
// later `O = makeThing()` may hold an INSTANCE at the use, and the static axis carries nothing for
// it, so the typeless instance row rides beside the static primary. the boundaries keep the static
// axis alone: an alias that is never reassigned, and one whose every reachable value resolves to a
// constructor, both dispatch statics exclusively. every row calls a name registered BOTH as an
// `Object` static and as an instance method, so a wrongly-added instance row shows up as the array
// and dom-collection variants appearing beside the static one - the boundaries assert an ABSENCE
// that the emitted set can actually show. distinct method per line so each row is attributable
let unresolvable = Object;
if (c) unresolvable = makeThing();
export const a = unresolvable.entries(x);
let never = Object;
export const b = never.keys(x);
let allResolvable = Object;
if (d) allResolvable = globalThis.Object;
export const c2 = allResolvable.values(x);
