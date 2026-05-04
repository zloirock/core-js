import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
// 4-hop chain with side-effect at the deepest level. outer3() -> outer2() -> outer1() ->
// inner() where ONLY inner has the prefix statement. recursive descent in
// `inlineCallHasObservableEffects` propagates effect detection up through ALL hops to the
// outermost call site, so SE-wrap on outer3() preserves the deepest inc++ at runtime.
// Promise.reject is a dedicated static polyfill (`promise/reject`), so emit goes through
// `_Promise$reject` static dispatch where SE-wrap is observable in the output
let inc = 0;
const inner = () => {
  inc++;
  return _Promise;
};
const outer1 = () => inner();
const outer2 = () => outer1();
const outer3 = () => outer2();
const out = (outer3(), _Promise$reject)(1);
export { inc, out };