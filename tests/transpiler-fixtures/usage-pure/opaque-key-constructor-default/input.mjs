// An opaque computed key keeps its nested receiver default native.
// The substituted constructor must carry the method read by the pattern.
const k = String(Math.random());
const { [k]: { groupBy } = Map } = {};
export const r = groupBy([1, 2], value => value % 2).get(1)[0];
