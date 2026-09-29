// A conditional pattern alias retains the static family for a presence test.
let M;
if (true) ({ Map: M } = globalThis);
export const result = 'groupBy' in M;
