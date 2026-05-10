// callee wrapped in TS satisfies: parallel to TSAsExpression. resolveCallReturnType's
// gated ambient lookup must let non-Identifier callees fall through to
// resolveCallReturnTypeFromAnnotation, which handles all TS expression wrappers
declare const fn: () => number[];
const r = (fn satisfies () => number[])();
r.includes(1);
