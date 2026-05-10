// callee wrapped in TS cast (`as`) - call-return resolver must reach annotation
// through findExpressionAnnotation even when callee.node is not bare Identifier
declare const fn: () => string[];
const r = (fn as () => string[])();
r.at(0);
