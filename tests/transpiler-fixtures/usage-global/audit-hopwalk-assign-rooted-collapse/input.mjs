// usage-global twin of the chain-assignment-rooted hop collapse: the detection side must see the
// SAME roots the emit side collapses, so every line still contributes its leaf usage to the
// import set. distinct constructors and methods per line attribute a missed root to its form.
let a, b, c, d;
const g = globalThis;
export const viaAssign = (a = globalThis).self.Array.from([1]);
export const pureLeaf = (b = globalThis).self.Map;
export const noHop = (c = globalThis).Promise;
export const aliasInAssign = (d = g).self.Reflect.ownKeys({});
export const nestedAssign = [1, 2].at(-1);
