import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Set from "@core-js/pure/actual/set/constructor";
// chain-assignment receiver with an IIFE-prefix side effect returning Promise, plus another
// global (Set) inside the IIFE body as an ExpressionStatement. the outer static dispatch still
// fires and subsumes the receiver into a SequenceExpression; both `Promise` (returned) and `Set`
// (visited as expression) must be polyfilled inside the preserved IIFE body, and `calls++` runs once
let a;
let calls = 0;
const r = (a = (() => {
  calls++;
  void _Set;
  return _Promise;
})(), _Promise$resolve)(1);
[r, a, calls];