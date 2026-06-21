// `(Array.from as any)?.([1])` - the optional call sits on a TSAsExpression-wrapped static.
// the post-replace deoptimize walk must peel transparent wrappers (TSAsExpression /
// ParenthesizedExpression / ChainExpression), not just the immediate parent: after
// `Array.from` -> `_Array$from` the `?.` is pointless and the CallExpression de-optimizes.
(Array.from as any)?.([1]);
