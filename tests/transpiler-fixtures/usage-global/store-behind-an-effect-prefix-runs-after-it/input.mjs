// usage-global reads a leaf through a store behind an effect prefix to the constructor in the stored
// literal's slot and loads its static, for one extraction and for several
var one, two;
export const { C: { groupBy } } = (setup(), one = { C: Map });
export const { C: { from }, D: { of } } = (setup(), two = { C: Array, D: Array });
