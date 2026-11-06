// A prefix runs before the container store that follows it.
// Native nested static reads consume that same stored object.
var one, two;
export const { C: { groupBy } } = (setup(), one = { C: Map });
export const { C: { from }, D: { of } } = (setup(), two = { C: Array, D: Array });
export { one, two };
