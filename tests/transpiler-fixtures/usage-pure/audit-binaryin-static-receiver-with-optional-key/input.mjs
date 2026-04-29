// `'from' in (Array ?? Object)` - LogicalExpression on RHS, both branches global
// constructors. A logical expression cannot fold to a single static receiver, so the
// in-check stays raw and only the constructor proxies (Array, Object) are independently
// polyfilled via the identifier visitor in the second/third statements.
const a = 'from' in (Array ?? Object);
const b = Array.from(src);
const c = Object.fromEntries(pairs);
export { a, b, c };
