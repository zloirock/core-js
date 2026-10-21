// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
let out;
for (const [{ Array: { from } }] = (eff('outer'), [(eff('inner'), globalThis)]); !out;) out = from;
export { out, seen };
