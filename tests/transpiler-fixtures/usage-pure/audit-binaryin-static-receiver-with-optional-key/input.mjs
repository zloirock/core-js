// `'from' in (Array ?? Object)` - LogicalExpression on RHS, both branches global
// constructors. resolveObjectName cannot fold a LogicalExpression to a single static
// receiver, so the in-check stays raw and only the constructor proxies (Array, Object)
// are independently polyfilled via identifier visitor in the second/third statements.
const a = 'from' in (Array ?? Object);
const b = Array.from(src);
const c = Object.fromEntries(pairs);
export { a, b, c };
