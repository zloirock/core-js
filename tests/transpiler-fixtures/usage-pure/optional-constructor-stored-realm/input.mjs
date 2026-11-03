// Both stores preserve their values while the optional static retains its claim.
export const effects = [];
let held;
let other;
export const r = (held = (other = globalThis).Array).from?.([1, 2]).at(-1);
