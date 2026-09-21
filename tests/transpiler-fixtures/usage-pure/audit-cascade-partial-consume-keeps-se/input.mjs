// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let effectRan = false, rest;
let from;
(({ Array: { from }, ...rest } = (effectRan = true, globalThis).self));
let counted = 0, keep;
let of;
(({ Array: { of }, keep } = (counted++, globalThis).self));
export const r = [from, of, rest, keep, effectRan, counted];
