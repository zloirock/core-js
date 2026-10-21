// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const rest = [];
{
const { w: { Map: m, Set: s }, ...rest } = { w: globalThis, z: 1 }; use(m, s, rest);
}
