// AssignmentExpression cascade variant of the static-object partial-consume SE-prefix bug:
// the cascade lifts the side-effect prefix (`log()`) as a standalone statement. the
// preserved destructure must then reference only the sequence tail (`wrapper`) - embedding
// the original `(log(), wrapper)` would re-execute `log()` on top of the lift.
const wrapper = { Array, other: 1 };
let from, other;
({ Array: { from }, other } = (log(), wrapper));
