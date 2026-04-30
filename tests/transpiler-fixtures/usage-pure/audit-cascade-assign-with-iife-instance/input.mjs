// AssignmentExpression flatten - cascade path emits multi-statement output covering the
// whole ExpressionStatement range. asserts whether instance-dispatch in a SE-prefix or
// preserved sibling triggers similar var _ref insert collision
let from, rest;
({ Array: { from }, ...rest } = (console.log([].values()), globalThis));
export { from, rest };
