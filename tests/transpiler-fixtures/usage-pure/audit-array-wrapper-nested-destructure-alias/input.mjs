// ArrayPattern-rooted nested destructure with a const-aliased ArrayExpression wrapper.
// Walks the ArrayPattern stack down to the host, dereferences the Identifier binding
// through its init, and descends ArrayExpression elements to reach the leaf constructor
// (`Array`). The array and property still read natively before the pure binding.
const wrapper = [Array];
const [{ from }] = wrapper;
from([1, 2]);
