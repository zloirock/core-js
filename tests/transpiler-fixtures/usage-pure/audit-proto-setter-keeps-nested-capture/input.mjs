// A `__proto__` literal entry sets the prototype instead of creating an own property.
// Keep the nested capture so its later pattern read observes `undefined`, not the initializer value.
const list = [[1]];
let at, proto;
({ y: { at }, __proto__: proto } = { y: list.flat(), __proto__: null });
export const result = [at.call([2], 0), proto];
