// An assignment pattern keeps the default behind an opaque computed key.
// Its substituted constructor must carry the static.
let groupBy;
({ [String(Math.random())]: { groupBy } = Map } = {});
export const r = groupBy([1], value => value).get(1)[0];
