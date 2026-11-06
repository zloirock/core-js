// Two guaranteed realm operands preserve the selected Promise static surface.
// The resolve call needs its static entry, including when native Promise is absent.
export const result = (globalThis && globalThis).Promise.resolve(1);
