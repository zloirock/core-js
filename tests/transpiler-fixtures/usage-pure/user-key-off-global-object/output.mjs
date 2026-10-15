import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// User keys on the realm can hold instances. Generic dispatch serves each runtime value
// through aliases, proxy hops and loop elements; the key's case proves no built-in type.
export const constAt = _at(_globalThis.y);
export let letAt = _at(_globalThis.y);
const wrappedAt = _at(_globalThis.y);
const siblingAt = _at(_globalThis.y);
const [{}, tail] = [_globalThis, 1];
const first = 1;
const multiAt = _at(_globalThis.y);
const capitalisedAt = _at(_globalThis.Y);
const hopAt = _at(_globalThis.y);
let assignedAt;
assignedAt = _at(_globalThis.Y);
for (const _ref of [_globalThis]) {
  const loopAt = _at(_ref.y);
  loopAt;
}
for (const _ref2 of [_globalThis]) {
  const capitalisedLoopAt = _at(_ref2.Y);
  capitalisedLoopAt;
}
const realm = _globalThis;
const aliasAt = _at(realm.y);
for (const element of [_globalThis]) {
  const elementAt = _at(element.y);
  elementAt;
}
// A user object resolves the leaf through its own type and keeps the claim.
const source = {
  y: [1, 2]
};
const sourceAt = _atMaybeArray(source.y);
export { wrappedAt, siblingAt, multiAt, sourceAt, first, tail, capitalisedAt, hopAt, assignedAt, aliasAt };