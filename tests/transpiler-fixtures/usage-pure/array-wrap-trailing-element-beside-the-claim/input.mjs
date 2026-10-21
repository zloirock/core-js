// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { fromEntries } }] = [(eff('e'), globalThis), eff('f')];
const [{ Promise: { allSettled } }] = [(eff('g'), globalThis), 7];
export { fromEntries, allSettled, seen };
