// stacked wrappers `((globalThis as any)!).Symbol.iterator` - peelMarkedWrappers recurses
// through TSNonNullExpression + TSAsExpression + ParenthesizedExpression at the root AND
// at the `.object` slot of every MemberExpression link
function check(x: unknown): boolean {
  return ((globalThis as any)!).Symbol.iterator in x;
}
