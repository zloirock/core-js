// TSSatisfiesExpression wrapper - unwrapParens peels it via TS_EXPR_WRAPPERS set,
// asSymbolRef must accept the unwrapped Identifier
const iter = obj[(Symbol satisfies unknown).iterator];
