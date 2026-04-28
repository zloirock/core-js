// `(require as any)('core-js/...')` - TS-wrapped require callee. pre-fix the parens-only
// peel left the TSAsExpression in place; the Identifier check failed and the entry was
// silently ignored (no expansion to per-module imports)
(require as any)(`core-js/actual/promise`);
