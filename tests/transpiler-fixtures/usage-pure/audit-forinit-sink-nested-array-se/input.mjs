// Both the outer sequence and inner array-element effects stay in the for-init header.
// The wrapper and its static from read remain native.
const seen = [];
const eff = t => (seen.push(t), t);
let out;
for (const [{ Array: { from } }] = (eff('outer'), [(eff('inner'), globalThis)]); !out;) out = from;
export { out, seen };
