// for-init SE-sink with a tail that still hides a nested effect below the top-level sequence
// peel: the sink keeps the whole tail text (lifting only the pure binding would drop the buried
// effect) and the buried proxy root is still substituted
const seen = [];
const eff = t => (seen.push(t), t);
let out;
for (const [{ Array: { from } }] = (eff('outer'), [(eff('inner'), globalThis)]); !out;) out = from;
export { out, seen };
