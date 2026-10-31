// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
{
const { w: { Map: m } } = { ...extra, w: globalThis }; use(m);
}
