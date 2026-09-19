import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// callee wrapped in TS non-null assertion `!`: parallel to TSAsExpression. callee.node
// is TSNonNullExpression so the early Identifier-gate returns null without the fix;
// the call-return-type resolution through the expression-annotation lookup handles the wrap
declare const fn: () => string[];
const r = fn!();
_includesMaybeArray(r).call(r, "x");