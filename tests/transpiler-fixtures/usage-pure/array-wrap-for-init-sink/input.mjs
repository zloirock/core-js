// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
let out1, out2, out3;
for (const [{ Object: { defineProperty } }] = [(eff('p'), globalThis), 7]; !out1;) out1 = defineProperty;
for (const [{ Object: { defineProperties } }] = [kw = (eff('q'), globalThis)]; !out2;) out2 = defineProperties;
for (const [{ Object: { getOwnPropertyNames } }] = [globalThis, eff('s')]; !out3;) out3 = getOwnPropertyNames;
let out4;
for (const [{ Array: { prototype: { at: soleAt } } }] = [kw = (eff('t'), globalThis)]; !out4;) out4 = soleAt;
export { out1, out2, out3, out4, seen, kw };
