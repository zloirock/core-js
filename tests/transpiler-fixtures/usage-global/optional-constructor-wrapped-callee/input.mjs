// Wrapping the callee must preserve its static claim through the stored constructor.
let held;
export const result = ((held = Array).from)?.([1, 2]).at(-1);
