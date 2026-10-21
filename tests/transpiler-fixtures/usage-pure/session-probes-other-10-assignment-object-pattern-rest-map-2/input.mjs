// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const rest = [];
{
let m, rest; ({ w: { Map: m }, ...rest } = { w: globalThis, z: 1 }); use(m, rest);
}
