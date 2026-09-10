// a store whose value LEAVES through a branch is read through all the same: the arm hands it to the
// reader above, so the probe folds there exactly as it does under a direct claim - both arms of a
// ternary and both operands of a logical carry it, a `&&` left included (it leaves when falsy, and
// that is still the value the reader receives). what carries nothing is a TEST slot: the branch
// reads it and hands its arms out instead, so the store there keeps the collapse's own spelling -
// the environment probe the source wrote to decide the branch stays a probe
let e = 0;
let held;
export const throughTernaryArm = (e ? (held = (e++, globalThis.self).window) : globalThis).Map.name;
export const throughTernaryAlternate = (e ? globalThis : (held = (e++, globalThis.self).window)).Map.name;
export const throughOr = ((held = (e++, globalThis.self).window) || globalThis).Map.name;
export const throughNullish = ((held = (e++, globalThis.self).window) ?? globalThis).Map.name;
export const throughAndRight = (globalThis && (held = (e++, globalThis.self).window)).Map.name;

export const throughAndLeft = ((held = (e++, globalThis.self).window) && globalThis).Map.name;

// ... and the one that hands nothing to the reader: the store keeps the collapse's own spelling
export const testSlotKeepsIt = ((held = (e++, globalThis.self).window) ? globalThis : globalThis).Map.name;

// ... and an ARM is a proxy surface by what it NAMES, not by how it is spelled: a realm navigation
// names the realm its root does, so the selection settles on that surface exactly as the bare name
// does and the claim above extracts. read through the hops only - the two negatives are the arms
// that name a value instead of a surface: one that can be ABSENT (a live `?.` over an unbacked hop)
// and one that carries an EFFECT, which the fold would drop with the arm
let c = 0;
export const navArms = (c ? globalThis.self : globalThis).Map.name;
export const navBothArms = (c ? globalThis.self : globalThis.self).Map.name;
export const liveOptionalArm = (c ? globalThis.window?.self : globalThis).Map.name;
export const seqArm = (c ? (c++, globalThis.self) : globalThis).Map.name;
export { c, e, held };
