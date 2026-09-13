// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let effectRan = false, rest;
let from;
(({ Array: { from }, ...rest } = (effectRan = true, globalThis).self));
let counted = 0, keep;
let of;
(({ Array: { of }, keep } = (counted++, globalThis).self));
export const r = [from, of, rest, keep, effectRan, counted];
