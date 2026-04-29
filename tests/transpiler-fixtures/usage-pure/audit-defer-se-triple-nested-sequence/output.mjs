import _Array$from from "@core-js/pure/actual/array/from";
a++, b++, c++;
// triple-nested SequenceExpression `(a, (b, (c, Array)))` exercises recursive flatten.
// Each nesting level contributes its expressions to the lifted statement so the trailing
// no-op `Array` strips correctly, leaving `a, b, c;` (all SE-bearing here)
var from = _Array$from;
from([1]);