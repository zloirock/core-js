// Distinct Map / Set returns do not prove one receiver. Keep the conditional call and
// prototype reads intact; neither namespace escapes, so the constructor entries stay narrow.
const tailFrom = (() => { if (cond) return Map; return Set; })().from([1]);
const tailIntersect = (() => { if (cond) return Map; return Set; })().prototype.intersection;
export { tailFrom, tailIntersect };
