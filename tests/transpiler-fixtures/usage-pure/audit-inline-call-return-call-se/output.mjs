import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// arrow with block body whose ONLY top-level statement is `return innerCall();` (single
// return wrapping a call). `singleReturnBodyExpression` extracts the call, then recursive
// descent in `inlineCallHasObservableEffects` checks innerCall for effects. inner has
// prefix statement -> outer wrapping single-return inherits the effect, SE-wrap emitted.
// Promise.resolve is a dedicated static polyfill - SE-wrap visible in output
let inc = 0;
const inner = () => {
  inc++;
  return _Promise;
};
const wrapper = () => {
  return inner();
};
const out = (wrapper(), _Promise$resolve)(2);
export { inc, out };