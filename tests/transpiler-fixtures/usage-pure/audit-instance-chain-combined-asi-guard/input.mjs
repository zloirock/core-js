// instance-chain-combined emit (`replaceInstanceChainCombined`) wraps the conditional
// rewrite в parens когда parent demands grouping (BinaryExpression here: `... + 1`).
// at a statement-leading slot the `(`-prefix would fuse with the preceding statement
// via ASI (`f()\n(_polyfill(...))` -> `f()(...)` - TypeError at runtime). asiGuardLeadingParen
// inserts a leading `;` so ASI sees a separate statement boundary
f()
arr.flat?.().map(y => y) + 1;
