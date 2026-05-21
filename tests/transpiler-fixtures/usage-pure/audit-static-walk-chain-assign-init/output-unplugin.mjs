import _Array$from from "@core-js/pure/actual/array/from";
// chain-assignment init: `const wrapper = (x = Array)` evaluates to its RHS (Array) at
// runtime. walkStaticReceiverStep used to read init directly, bailing on the wrapping
// AssignmentExpression (`current.type !== 'ObjectExpression'`). added unwrapChainAssignment
// Init peel that loops through nested `(y = (x = Src))` chains so the receiver finally
// resolves to Array and the destructured `from` triggers the polyfill
let x;
const wrapper = (x = Array);
const from = _Array$from;
from([1, 2, 3]);