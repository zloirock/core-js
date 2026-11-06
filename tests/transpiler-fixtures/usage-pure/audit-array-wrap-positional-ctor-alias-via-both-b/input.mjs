// Two realm elements retain independent positional constructor hints while their patterns stay native.
// A later Promise.allSettled call is served through the second binding.
const [{ Array: F }, { Promise: P }] = [globalThis, globalThis];
export const viaBothB = P.allSettled([]);
