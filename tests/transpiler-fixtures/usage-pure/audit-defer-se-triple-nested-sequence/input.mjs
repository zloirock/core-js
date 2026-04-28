// triple-nested SequenceExpression `(a, (b, (c, Array)))` exercises the recursive
// `flattenSequence` helper. pre-fix the trim only inspected the top-level expressions
// list, so a single layer of nesting (`(b, (c, Array))`) hid the trailing `Array` from
// the no-op tail check. post-fix flatten produces `[a, b, c, Array]`, then the trailing
// trim drops `Array`, leaving `a, b, c;` (assuming all have side effects)
var { from } = (a++, (b++, (c++, Array)));
from([1]);
