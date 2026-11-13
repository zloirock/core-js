// Keep the source guard and distinguish realm values from user properties.
// core-js-disable-file
function get() { return globalThis.window; } export const r = get()?.Array?.from([3]);
