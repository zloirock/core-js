// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
for (const [{ from } = Array, tail] of [[undefined, 1], [Array, 2]]) out.push(from([1]).length + tail);
export { out };
