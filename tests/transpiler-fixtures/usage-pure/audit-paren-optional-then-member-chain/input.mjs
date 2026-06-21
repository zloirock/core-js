// paren-wrapped optional member with non-call sequel: `(arr?.at).length` and
// `(arr?.flat).name`. parent is MemberExpression (not CallExpression), so neither the
// paren-lookup-only nor the call branch fires. should fall to the bare lookup branch
// `_at(arr).length` etc. distinct methods/property accesses per line for visibility
const a = (arr?.at).length;
const b = (arr?.flat).name;
const c = (arr?.includes).bind;
export { a, b, c };
