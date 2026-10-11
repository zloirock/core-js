// a store behind an effect prefix runs after it: the prefix lifts first and the store lands between it and
// the extractions it feeds, for one extraction and for several
var one, two;
export const { C: { groupBy } } = (setup(), one = { C: Map });
export const { C: { from }, D: { of } } = (setup(), two = { C: Array, D: Array });
export { one, two };
