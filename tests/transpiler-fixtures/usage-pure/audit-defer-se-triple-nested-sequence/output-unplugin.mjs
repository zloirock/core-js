import _Array$from from "@core-js/pure/actual/array/from";
// triple-nested comma expression `(a, (b, (c, Array)))` exercises recursive flatten.
// Each nesting level contributes its expressions to the lifted statement so the trailing
// no-op `Array` strips correctly, leaving `a, b, c;` (all side-effect-bearing here)
a++, b++, c++;
var from = _Array$from;
from([1]);