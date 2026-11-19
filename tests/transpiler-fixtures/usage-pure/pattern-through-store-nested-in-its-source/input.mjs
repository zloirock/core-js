// Stores nested inside array sources preserve the actual container identity.
// Native groupBy and allSettled reads use full Map and Promise entries.
let cache;
export const [[{ groupBy }]] = [(cache = [Map])];

let kept;
export const [{ allSettled }] = (kept = [Promise]);
