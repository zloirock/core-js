import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// AssignmentExpression host (not VariableDeclarator) with AssignmentPattern wrapper.
// Walker's `cascadeAssignmentExpressionDestructure` path fires because parent matches
// AssignmentExpression+ExpressionStatement. The peeled `leftmost` value (outermost
// wrapper) matches `parent.node.left` after peel - without the leftmost tracking, LHS
// match would compare against the bare ObjectPattern and skip cascade
let from;
let of;
from = _Array$from;
of = _Array$of;
from('hi');
of(1, 2);