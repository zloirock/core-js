// for-init SE-sink with an effect at BOTH wrapper levels (a top-level prefix and one buried in
// the array element): the canonical descent flattens both into the sink sequence in source
// order - the discarded wrapper drops, the effects and the substituted proxy root survive
const seen = [];
const eff = t => (seen.push(t), t);
let out;
for (const [{ Array: { from } }] = (eff('outer'), [(eff('inner'), globalThis)]); !out;) out = from;
export { out, seen };
