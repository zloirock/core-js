// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
let out1;
for (const [{ Array: { from } }] = [(eff('a'), globalThis)]; !out1;) out1 = from;
let out2;
for (const [{ Array: { of }, ...rest2 }] = [(eff('b'), globalThis)]; !out2;) out2 = of;
let fa;
let rest3;
([{ Array: { fromAsync: fa }, ...rest3 }] = [(eff('c'), globalThis)]);
export { out1, out2, fa, rest3, seen };
