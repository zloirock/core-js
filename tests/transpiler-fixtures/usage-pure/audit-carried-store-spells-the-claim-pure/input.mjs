// Source stores keep their own values and evaluation order when a carrier hands them to a claim.
// A plain run ending at backed self stores that ponyfill, so the outer optional adds no guard.
// Each alias is assigned once to keep the store-follow boundary visible.
let v, g, out;
out = (g = globalThis, v = g.window.self)?.Number.MAX_SAFE_INTEGER.name;
export const read = out;
