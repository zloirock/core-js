// an INLINE-array spread in a wrapper literal pairs by static position, so the static the slot
// holds is a claim: one module per row. the spread syntax itself keeps its iterator modules
const [{ from }] = [...[Array]];
const [, { fromEntries }] = [...[0, Object]];
const [[{ groupBy }]] = [...[[...[Object]]]];
const [{ hasOwn }] = [...[c ? Object : userObj]];
const [{ values }] = [...([Object])];
export { from, fromEntries, groupBy, hasOwn, values };
