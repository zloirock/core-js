// A sequence inside the stored value keeps its global substitution in the lifted test.
let held;
export const value = (held = (prefix(), globalThis).window)?.Set.prototype.has;
