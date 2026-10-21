// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
{
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const r = ((a: any) => a)(...([Array] as any)); const [{ of: o }] = [...([Array])];
}
