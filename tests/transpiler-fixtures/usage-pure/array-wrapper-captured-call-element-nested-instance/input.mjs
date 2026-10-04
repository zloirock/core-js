// A computed wrapper element is captured before its nested instance read.
// Each element evaluates once and sibling effects retain their source order.
// A proven realm result uses the Array dispatcher, reading the captured element.
const seen = [];
const eff = t => (seen.push(t), t);
const realm = () => globalThis;
const [{ Array: { prototype: { at: soleAt } } }] = [realm()];
let out;
for (const [{ Array: { prototype: { at: headAt } } }, tail] = [realm(), eff('t')]; !out;) out = [headAt, tail];
export { soleAt, out, seen };
