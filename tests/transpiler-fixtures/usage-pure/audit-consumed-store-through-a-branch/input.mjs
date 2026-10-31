// A stored navigation carried by a branch reaches the constructor claim above it.
// Both ternary arms and logical operands select the realm, so Map injects while stores and
// effects remain in place. A store used only as the test retains its environment probe.
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

// Plain navigation and effectful sequence arms still provide the realm's Map.
// A live optional arm retains its selected value and throws if that value is absent.
let c = 0;
export const navArms = (c ? globalThis.self : globalThis).Map.name;
export const navBothArms = (c ? globalThis.self : globalThis.self).Map.name;
export const liveOptionalArm = (c ? globalThis.window?.self : globalThis).Map.name;
export const seqArm = (c ? (c++, globalThis.self) : globalThis).Map.name;
export { c, e, held };
