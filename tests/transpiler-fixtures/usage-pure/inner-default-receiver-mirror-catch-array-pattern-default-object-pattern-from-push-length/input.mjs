// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
try {
  throw [undefined];
} catch ([{ from: caught } = Array]) {
  out.push(caught([1]).length);
}
export { out };
