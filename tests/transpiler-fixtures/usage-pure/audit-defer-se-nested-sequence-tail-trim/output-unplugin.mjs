import _Array$from from "@core-js/pure/actual/array/from";
// SE init lift: the destructure target is extracted and the leading SequenceExpression
// is lifted as a standalone statement. Trailing no-op tail (the destructure target name
// after extraction) gets trimmed. Nested SE `(x++, (y++, Array))` flattens recursively
// so the trailing `Array` strips correctly, leaving `x++, y++;` without a dangling read
(x++, (y++, Array));
var from = _Array$from;
from([1]);