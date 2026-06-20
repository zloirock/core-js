// the destructure key is COMPUTED through a const alias (`const k = "x"; const { [k]: A } = ...`).
// the resolver follows the same key canon the read side uses to pair the slot, so the value alias
// resolves - in declarations AND in reassignments
const k = "x";
const { [k]: A } = { x: Map };
A.groupBy([], (x) => x);

const j = "y";
let B;
({ [j]: B } = { y: Object });
B.fromEntries([["k", 1]]);
