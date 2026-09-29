// A USER key off the global object itself names no surface the plugin models: an instance leaf
// under it is a name match both legs keep native, on every declaration host - a capitalised key
// included, past a pristine proxy hop, on an assignment and on a loop head, and under every name
// that holds the realm (an alias, a loop variable over it).
export const { y: { at: constAt } } = globalThis;
export let { y: { at: letAt } } = globalThis;
const [{ y: { at: wrappedAt } }] = [globalThis];
const [{ y: { at: siblingAt } }, tail] = [globalThis, 1];
const first = 1, { y: { at: multiAt } } = globalThis;
const { Y: { at: capitalisedAt } } = globalThis;
const { self: { y: { at: hopAt } } } = globalThis;
let assignedAt;
({ Y: { at: assignedAt } } = globalThis);
for (const { y: { at: loopAt } } of [globalThis]) loopAt;
for (const { Y: { at: capitalisedLoopAt } } of [globalThis]) capitalisedLoopAt;
const realm = globalThis;
const { y: { at: aliasAt } } = realm;
for (const element of [globalThis]) {
  const { y: { at: elementAt } } = element;
  elementAt;
}
// A user object resolves the leaf through its own type and keeps the claim.
const source = { y: [1, 2] };
const { y: { at: sourceAt } } = source;
export { wrappedAt, siblingAt, multiAt, sourceAt, first, tail, capitalisedAt, hopAt, assignedAt, aliasAt };
