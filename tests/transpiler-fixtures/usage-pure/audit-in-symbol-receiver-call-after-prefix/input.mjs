// symbol-in fold where the LHS receiver is a sequence prefix followed by an impure chain-root call
// (zero-arg IIFE returning the global). the prefix lexically precedes the receiver, so it runs BEFORE
// the chain-root call - source order [prefix, IIFE], not [IIFE, prefix].
const r = (log.push('p'), (() => { log.push('r'); return globalThis; })()).Symbol.iterator in [];
export { r };
