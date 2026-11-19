// Effects inside an array element run once in for-init and assignment hosts.
// Captured static leaves beside rest are served; the simple wrapper keeps its native from read.
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
