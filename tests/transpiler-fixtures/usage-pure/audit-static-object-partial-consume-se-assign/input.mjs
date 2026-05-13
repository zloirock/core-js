// AssignmentExpression cascade variant of the static-object partial-consume SE-prefix bug:
// rewriteDeclarator runs against the fake `{ id, init: assignNode.right }` and the cascade
// lifts the SE prefix as a standalone statement. The preserved destructure must reference
// the SE tail (`wrapper`) only - embedding the original `(log(), wrapper)` would re-execute
// `log()` on top of the lift.
const wrapper = { Array, other: 1 };
let from, other;
({ Array: { from }, other } = (log(), wrapper));
