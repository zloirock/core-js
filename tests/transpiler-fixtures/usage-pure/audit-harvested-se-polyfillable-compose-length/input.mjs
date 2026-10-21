// A pure static call inside a retained realm key remains independently polyfilled.
let a1;
const { iterator } = globalThis[(a1 = Array.of(1), 'self')].Symbol;
export const r1 = [typeof iterator, a1.length];
