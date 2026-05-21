// chain-assignment init: `const wrapper = (x = Array)` evaluates to its RHS (Array) at
// runtime. walkStaticReceiverStep used to read init directly, bailing on the wrapping
// AssignmentExpression (`current.type !== 'ObjectExpression'`). added unwrapChainAssignment
// Init peel that loops through nested `(y = (x = Src))` chains so the receiver finally
// resolves to Array and the destructured `from` triggers the polyfill
let x;
const wrapper = (x = Array);
const { from } = wrapper;
from([1, 2, 3]);
