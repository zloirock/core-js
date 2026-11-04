// A store of self leaves the following window read dependent on the environment.
let held;
export const last = (held = globalThis.self).window?.Array.from([1, 2]).at(-1);
export const iter = (held = globalThis.self).window?.Array.from([3])[Symbol.iterator]();
