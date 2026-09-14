// A sole array-wrapped element the source computes is captured into a binding, and the nested
// instance leaf reads through it. Where the element resolves to the global object, both legs narrow
// the dispatcher to the Array variant: the shared surface resolver names the root the value canon
// proves (a call yielding the global object) the way the member spelling's chain typing does. The
// babel leg additionally re-anchors the captured receiver on the global (`_globalThis.Array
// .prototype`) where the unplugin leg keeps the captured ref - the same import set, two spellings.
const seen = [];
const eff = t => (seen.push(t), t);
const realm = () => globalThis;
const [{ Array: { prototype: { at: soleAt } } }] = [realm()];
let out;
for (const [{ Array: { prototype: { at: headAt } } }, tail] = [realm(), eff('t')]; !out;) out = [headAt, tail];
export { soleAt, out, seen };
