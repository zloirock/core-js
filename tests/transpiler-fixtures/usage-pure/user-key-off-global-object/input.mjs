// User keys on the realm can hold instances. Generic dispatch serves each runtime value
// through aliases, proxy hops and loop elements; the key's case proves no built-in type.
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
