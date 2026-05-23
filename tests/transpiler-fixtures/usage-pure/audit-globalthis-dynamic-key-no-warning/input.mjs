// dynamic Identifier key resolved at runtime - out of scope for static analysis,
// `memberKeyName` returns null and the warning gate stays closed
const k = "Map";
globalThis[k] ||= {};
