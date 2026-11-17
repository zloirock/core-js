// Partial writes follow the original property order, including before a missing slot.
// The receiver prefix observes state before either target is written.
let first, second;
({ Map: first, missing: second } = (observe(first), globalThis.window));
({ missing: second, Map: first } = (observe(first), globalThis.window));
({ left: second, Map: first, right: second } = globalThis.window);
export { first, second };
