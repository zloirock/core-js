import _self from "@core-js/pure/actual/self";
// proxy-hop collapse must drop the redundant `.self` hop even when oxc preserves a
// ParenthesizedExpression that babel's AST folds away. a paren on the ROOT (`(globalThis).self.Array`)
// or a computed-alias root is consumed together with the prefix -> `_globalThis.Array`. a paren around
// the whole PREFIX (`(globalThis.self).Array`) also collapses to `_globalThis.Array` on BOTH emitters
// (the read receiver routes through the shared resolver, which strips the paren), so there is no
// sidecar. crucially NEITHER leaves a residual `.self` hop, the off-engine-unsafe form this fix removes.
const aliasKey = "self";
const rootParen = new _self.Array(3);
const computedAliasRootParen = new _self.Array(3);
const prefixParen = new _self.Array(3);
export { rootParen, computedAliasRootParen, prefixParen };