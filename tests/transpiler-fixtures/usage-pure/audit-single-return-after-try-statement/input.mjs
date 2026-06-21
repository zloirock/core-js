// IIFE body wraps the receiver in a TryStatement before the unreachable tail return. try
// returns Map, catch returns Set, dead-code tail returns Array - receiver is dynamically
// Map or Set. receiver resolution must bail on TryStatement (only Expression / Return
// statements pass): outer call stays raw, inner Map / Set still polyfill. distinct methods
const tryFrom = (() => { try { return Map; } catch { return Set; } return Array; })().from([1]);
const tryIntersect = (() => { try { return Map; } catch { return Set; } return Array; })().prototype.intersection;
export { tryFrom, tryIntersect };
