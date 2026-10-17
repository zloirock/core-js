// both-global multi-element: each folds to its own positional global
const [{ Array: F }, { Promise: P }] = [globalThis, globalThis];
export const viaBothA = F.from([1]);
