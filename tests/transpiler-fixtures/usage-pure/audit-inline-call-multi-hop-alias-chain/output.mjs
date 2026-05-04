import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
// multi-hop alias chain through inline-call body returns. outer arrow's body is a
// CallExpression to the next arrow; `resolveObjectName` recurses on the inner call,
// `inlineCallHasObservableEffects` recurses through the same chain to detect prefix
// statements at any depth. cycle guard via shared `seen` Set prevents stack overflow
// on cyclic chains (`a => b(); b => a()`); resolution bottoms out on the deepest arrow
// whose body returns the global constructor
//
// shape A - chain depth 2: outerA() -> innerA() -> Promise. receiver narrows to Promise,
// no prefix statements anywhere in the chain - clean polyfill emission, no SE wrap
const innerA = () => _Promise;
const outerA = () => innerA();
const a1 = _Promise$resolve(1);
// shape B - chain depth 3: c1() -> d2() -> e3() -> Map. all expression-body arrows, no
// observable effects through the chain - clean polyfill, no SE wrap
const e3 = () => _Map;
const d2 = () => e3();
const c1 = () => d2();
const b1 = _Map.get('k');
// shape C - inner callee has block-body with prefix ExpressionStatement. outer arrow has
// expression-body returning innerSE() - the OUTER call carries no direct effects, but
// recursive descent through the alias chain finds inner's prefix `inc++`. emit SE-wraps
// the original outer call: `(outerSE(), _Promise$reject)(2)` - outerSE() runs, triggers
// inner inc++, polyfill called with args. side-effect preserved + polyfill applied
let inc = 0;
const innerSE = () => {
  inc++;
  return _Promise;
};
const outerSE = () => innerSE();
const c2 = (outerSE(), _Promise$reject)(2);
export { a1, b1, c2, inc };