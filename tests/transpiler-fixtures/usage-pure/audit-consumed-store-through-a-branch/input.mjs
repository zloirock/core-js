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
export { e, held };
