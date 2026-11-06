// proxy-global wrapped in parens at the leaf of the receiver chain
// (`(globalThis)?.X.prototype.method(...)`). When the parser keeps parens as AST nodes,
// the wrapper above `globalThis` is peeled and the substitution writes
// `_globalThis.X.prototype.method(...)`. The tail of the leaf anchors past the closing
// `)`, so the splice does not leak the closing paren into the substituted source
(globalThis)?.Array.prototype.at(0);
