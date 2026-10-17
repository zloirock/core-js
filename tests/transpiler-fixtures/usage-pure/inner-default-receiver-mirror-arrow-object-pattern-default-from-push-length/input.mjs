// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
(({ k: { from } = Array }) => out.push(from([1]).length))({ k: Array });
export { out };
