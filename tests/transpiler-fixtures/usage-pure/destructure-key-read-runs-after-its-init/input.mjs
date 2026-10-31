// a destructure reads its keys - and runs its defaults - once the value it destructures has evaluated, so a write
// in that value, or in a default ahead of the key, has landed by the read: the key reads the user's slot, a realm
// hop and a global's static alike
const { self: { Array: A } } = (globalThis.self = fake, globalThis);
const { Map: { groupBy } } = (globalThis.Map = MyMap, globalThis);
const { a = (globalThis.Set = MySet), Set: S } = globalThis;
let B;
({ self: { Array: B } } = (globalThis.self = other, globalThis));
export { A, groupBy, a, S, B };
