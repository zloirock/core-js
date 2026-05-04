// IIFE body wraps the receiver in a TryStatement before the unreachable tail return. try
// returns Map normally, catch returns Set on throw, dead-code tail returns Array. receiver
// is dynamically Map or Set; tail is unreachable. `singleReturnBodyExpression` bails on
// TryStatement (only Expression / Return statements pass the gate), so the outer IIFE call
// stays raw and the receiver chain is not pre-resolved. inner Map / Set constructor
// references still polyfill via the identifier visitor. distinct methods per line
const tryFrom = (() => { try { return Map; } catch { return Set; } return Array; })().from([1]);
const tryIntersect = (() => { try { return Map; } catch { return Set; } return Array; })().prototype.intersection;
export { tryFrom, tryIntersect };
