// Two realm elements retain independent positional constructor hints while their patterns stay native.
// A later Array.from call is served through the first binding.
const [{ Array: F }, { Promise: P }] = [globalThis, globalThis];
export const viaBothA = F.from([1]);
