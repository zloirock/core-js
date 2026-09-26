// a destructure-assignment wrapped in TS `as any`: `({ from } = Array) as any;`. confirming the
// AssignmentExpression is the whole statement requires peeling TS wrappers (`TSAsExpression`,
// `TSSatisfiesExpression`, etc.) between the Assignment and its ExpressionStatement; without that
// the gate silently bails and the destructure rewrite is dropped. fixed in both plugins' emitters
let from: any;
({ from } = Array) as any;
console.log(from);
