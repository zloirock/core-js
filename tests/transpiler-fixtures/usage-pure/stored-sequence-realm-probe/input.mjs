// The stored value and its reader share one nullable realm probe.
// The sequence prefix runs once, including when window is absent.
let held;
export const value = (held = (visit(), globalThis).window?.self);
export { held };
