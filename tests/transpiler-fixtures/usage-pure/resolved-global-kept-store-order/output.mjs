import _globalThis from "@core-js/pure/actual/global-this";
// A write through a stored environment probe keeps the store's value and throws.
// A later computed key prevents erasing the hop; a leading effect stays before it.
let held;
(held = _globalThis.window, null == held ? null.self : held).resolvedClaimSlot = rhs();
(before(), held = _globalThis.window, null == held ? null.self : held).resolvedClaimSlot = rhs();
(held = _globalThis.window)[key(), 'self'].resolvedClaimSlot = rhs();
export { held };