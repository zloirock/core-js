// `(Promise?.foo)?.bar.includes(2)` - non-POSSIBLE_GLOBAL leaf (Promise) through Paren
// wrapper. resolveProxyGlobalChainSrc still substitutes `Promise` -> `_Promise` via
// rebuild path because the chain-substituter accepts ANY polyfillable global, not just
// the IE11-ReferenceError-prone proxy set. asserts the rebuild path works uniformly
// across leaf identifiers regardless of POSSIBLE_GLOBAL_OBJECTS membership.
(Promise?.foo)?.bar.includes(2);
