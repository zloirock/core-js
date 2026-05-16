// `for (var {Array:{from}} = ((se(), globalThis) as any); ;)` - TS `as` wrapper around
// SequenceExpression init. for-init flatten path peels only ParenthesizedExpression when
// checking for SE init, so the TS cast hides the SE: forInitRaw stays as TSAsExpression,
// the `isForInitWithSE` gate misses, and `se()` gets dropped from the rewrite. peel must
// also strip TS / Chain wrappers to reach the underlying SequenceExpression.
for (var { Array: { from } } = ((se(), globalThis) as any); from === undefined; ) break;
export { from };
