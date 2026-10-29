// A transparent type wrapper preserves the environment probe above a store.
// The optional static call keeps its argument on the defined branch only.
let held;
let effects = 0;
export const value = ((held = globalThis.self) as any).window?.Array.from((effects++, [1]));
export { held, effects };
