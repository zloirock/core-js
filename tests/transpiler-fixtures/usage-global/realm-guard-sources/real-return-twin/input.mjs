// Keep the source guard and distinguish realm values from user properties.
function inner() { return globalThis; } function outer() { return inner(); } export const r = outer().window?.Array?.from([3]);
