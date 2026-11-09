// Replacing a defined static does not remove an optional testing its derived value.
export const read = () => globalThis?.Array.from([1]).foo?.();
