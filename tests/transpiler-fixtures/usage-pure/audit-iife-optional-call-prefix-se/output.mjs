import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
// OptionalCallExpression receiver with a side-effecting block body: same SE-wrap
// path as CallExpression. buildMemberMeta accepts both `obj.type === CallExpression`
// AND `OptionalCallExpression`. expected: `k?.()` re-emits at call site, polyfill
// dispatches Promise.resolve - this is the optional-call symmetry probe
let calls = 0;
const k = () => {
  calls++;
  return _Promise;
};
const out1 = (k?.(), _Promise$resolve)(1);
// pure single-return optional-call: no prefix statement, no SE wrap. resolves
// directly through inlineCallReturnExpression to Promise; polyfill replaces the
// entire chain. distinct method `.reject` to show this is the no-SE branch
const m = () => _Promise;
const out2 = _Promise$reject(2);
export { out1, out2, calls };