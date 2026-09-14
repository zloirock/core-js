// A USER key off the global object itself names no surface the plugin models: an instance leaf
// under it is a name match both legs keep native, on every declaration host.
export const { y: { at: constAt } } = globalThis;
export let { y: { at: letAt } } = globalThis;
const [{ y: { at: wrappedAt } }] = [globalThis];
const [{ y: { at: siblingAt } }, tail] = [globalThis, 1];
const first = 1, { y: { at: multiAt } } = globalThis;
// A user object resolves the leaf through its own type and keeps the claim.
const source = { y: [1, 2] };
const { y: { at: sourceAt } } = source;
export { wrappedAt, siblingAt, multiAt, sourceAt, first, tail };
