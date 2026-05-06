// AssignmentExpression host (not VariableDeclarator) with AssignmentPattern wrapper.
// Walker's `cascadeAssignmentExpressionDestructure` path fires because parent matches
// AssignmentExpression+ExpressionStatement. The peeled `leftmost` value (outermost
// wrapper) matches `parent.node.left` after peel - without the leftmost tracking, LHS
// match would compare against the bare ObjectPattern and skip cascade
let from;
let of;
({ Array: { from } = {} } = globalThis);
({ Array: { of } = {} } = globalThis);
from('hi');
of(1, 2);
