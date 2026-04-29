// side-effect init lift: the destructure target is extracted and the leading comma-expression
// is lifted as a standalone statement. Trailing no-op tail (the destructure target name
// after extraction) gets trimmed. Nested commas `(x++, (y++, Array))` flatten recursively
// so the trailing `Array` strips correctly, leaving `x++, y++;` without a dangling read
var { from } = (x++, (y++, Array));
from([1]);
