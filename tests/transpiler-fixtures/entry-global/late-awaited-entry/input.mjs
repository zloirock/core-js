export const before = typeof Array.prototype.at;
await import('core-js/actual/array/at');
export const after = typeof Array.prototype.at;
