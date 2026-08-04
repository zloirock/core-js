// `exclude` is a refusal the USER writes, and it lands INSIDE the family: with `web.self` filtered
// out the nav keeps that hop native while the rest of the chain still resolves. the guard must
// stand down for exactly the refused hop and no more - a per-name refusal, unlike `targets`, which
// refuses by engine support
globalThis.excludeBox = { list: ['ab', 'cd'], n: 4 };
let k = 0;
export const plain = globalThis.window?.self.excludeBox.list?.at(0);
export const layer = (globalThis.window?.self.excludeBox).list?.at(0);
export const seq = ('x', globalThis.window?.self.excludeBox.list)?.at(0);
export const claim = globalThis.window?.self.Array.of(1).at(0);
export const key = globalThis.window?.self.excludeBox.list[(k++, 'at')](0);
export const value = globalThis.window?.self.excludeBox.n;
export { k };
