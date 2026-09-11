import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE-prefix-SE body uses MULTIPLE distinct global constructors in ExpressionStatement
// position alongside the return. The outer static call subsumes the chain into a
// SequenceExpression that re-emits the IIFE body verbatim, so every inner Identifier
// (Map, Set, Promise) must receive its own polyfill substitution.
let calls = 0;
const r = ((() => {
  calls++;
  void _Map;
  void _Set;
  return _Promise;
})(), _Promise$resolve)(1);
[r, calls];