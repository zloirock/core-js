// callee wrapped in TS non-null assertion `!`: parallel to TSAsExpression. callee.node
// is TSNonNullExpression so the early Identifier-gate returns null without the fix;
// resolveCallReturnTypeFromAnnotation through findExpressionAnnotation handles the wrap
declare const fn: () => string[];
const r = fn!();
r.includes("x");
