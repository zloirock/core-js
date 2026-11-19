// A receiver that reaches a BRANCHING static value through SAFE indirection enumerates the same branch statics as the inline form:
// a const-alias init, a bound zero-arg callee (arrow and function declaration), and an alias-of-alias chain all resolve to the
// branching value, so each branch's static dep is injected (usage-global under-inject here broke the reachable branch on old
// engines).
const aliasInit = globalThis.cond ? Promise : Map;
export const viaAliasInit = aliasInit.any;
