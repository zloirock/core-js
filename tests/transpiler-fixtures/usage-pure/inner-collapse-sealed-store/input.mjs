// The sealed read keeps the throw and the independently served stored value.
let held;
export const value = ((held = globalThis.self).window?.self).Array.from([1]);
export { held };
