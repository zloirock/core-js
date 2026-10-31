// A write through a stored environment probe keeps the store's value and throws.
// A later computed key prevents erasing the hop; a leading effect stays before it.
let held;
(held = globalThis.window).self.resolvedClaimSlot = rhs();
(before(), held = globalThis.window).self.resolvedClaimSlot = rhs();
(held = globalThis.window)[(key(), 'self')].resolvedClaimSlot = rhs();
export { held };
