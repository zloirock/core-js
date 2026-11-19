// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
const pick = () => ({ from: () => [7] });
for (const [{ from } = Array] of [[pick()]]) out.push(from([1])[0]);
export { out };
