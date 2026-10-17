globalThis.callRootBox = { list: [[1]] };
const provenRoot = () => globalThis;
// NEGATIVE: the call yields the always-defined root, so its `?.` is dead text and the nav collapses
export const definedCallRoot = provenRoot()?.self.callRootBox.list;
