// `for (var {Array:{from}} = ((se(), globalThis) as any); ;)` - TS `as` wrapper around
// SequenceExpression init. If the for-init SE check peels only ParenthesizedExpression, the
// TS cast hides the SE: the init stays a TSAsExpression, the SE gate misses, and `se()` gets
// dropped from the rewrite. The peel must also strip TS / Chain wrappers to reach the
// underlying SequenceExpression.
for (var { Array: { from } } = ((se(), globalThis) as any); from === undefined; ) break;
export { from };
