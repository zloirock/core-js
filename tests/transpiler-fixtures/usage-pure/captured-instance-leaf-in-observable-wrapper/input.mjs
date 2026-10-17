// A sole instance leaf dispatches on its captured literal while its surrounding wrapper
// keeps spread evaluation, native iteration and outer computed keys. The consumed leaf
// must not perform another native method read beside the dispatch.
const { 0: { toSpliced: fromSpread } } = [...[[1]]];
const { w: { at: fromObjectSpread } } = { ...spread, w: [1, 2] };
const { [(mark(), 'w')]: { includes: afterOuterKey } } = { ...spread, w: [1, 2] };
if (ok) var { w: { findLast: inConditionalBody } } = { ...spread, w: [1, 2] };
export { fromSpread, fromObjectSpread, afterOuterKey, inConditionalBody };
