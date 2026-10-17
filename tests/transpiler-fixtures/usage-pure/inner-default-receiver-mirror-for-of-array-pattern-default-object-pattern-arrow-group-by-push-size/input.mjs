// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
for (const [{ groupBy } = Map] of [[undefined]]) out.push(groupBy([1, 2], x => x % 2).size);
export { out };
