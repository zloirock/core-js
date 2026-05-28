import _Array$from from "@core-js/pure/actual/array/from";
// ArrayPattern-rooted nested destructure with a const-aliased ArrayExpression wrapper.
// Walks the ArrayPattern stack down to the host, dereferences the Identifier binding
// through its init, and descends ArrayExpression elements to reach the leaf constructor
// (`Array`). emit flattens to a direct `const from = _Array$from` binding
const wrapper = [Array];
const from = _Array$from;
from([1, 2]);