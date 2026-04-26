// stacked wrappers `((globalThis as any)!).Symbol.iterator`: TS non-null + as-cast + paren
// layers must unwrap both at the root and at every MemberExpression `.object` slot so the
// chain is recognised as a `globalThis` proxy and the `Symbol.iterator` `in` flattens
function check(x: unknown): boolean {
  return ((globalThis as any)!).Symbol.iterator in x;
}
