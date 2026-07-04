// a conditionally reassigned computed-key alias on a static receiver unions its reachable
// keys; a branch that merely SPELLS a well-known symbol as a string resolves no polyfill
// (the read is a plain string prop), so only the genuinely resolvable branch injects
let K = 'from';
if (c) K = 'Symbol.iterator';
export const r = Array[K];
